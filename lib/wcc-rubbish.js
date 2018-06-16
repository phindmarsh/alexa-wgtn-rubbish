
const got = require('got');
const cheerio = require('cheerio');
const moment = require('moment');

const API_HOST = process.env.WCC_API_HOST;
const API_STREETS_PATH = process.env.WCC_API_STREETS_PATH;
const API_COLLECTION_SCHEDULE_PATH = process.env.WCC_API_COLLECTION_SCHEDULE_PATH;

const API_ENDPOINTS = {
    fetchStreetId: API_HOST + API_STREETS_PATH,
    fetchCollectionSchedule: API_HOST + API_COLLECTION_SCHEDULE_PATH
};

class UnknownStreetError extends Error { }
class MissingCollectionHtmlError extends Error { }
class UnknownCollectionHtmlError extends Error { }

const CollectionSchedule = class CollectionSchedule {
    constructor(streetName, suburb, apiEndpoints = API_ENDPOINTS) {
        this.streetName = streetName
        this.suburb = suburb;

        this.apiEndpoints = apiEndpoints;
    }

    async loadSchedule() {
        this.streetId = await this.fetchStreetId(this.streetName, this.suburb);
        console.log(`Fetching schedule for ${this.streetId}`);

        this.schedule = await this.fetchCollectionSchedule(this.streetId);

        return this.schedule
    }

    /**
     * Fetch the streetId for a given street. The challenge here is the WCC
     * API only accepts a street name and will return results matching any
     * suburb, so we need to manually match against the suburb.
     * 
     * @param {*} streetName 
     * @param {*} suburb 
     */
    async fetchStreetId(searchStreetName, searchSuburb) {
        return got.post(this.apiEndpoints.fetchStreetId, {
            json: true,
            body: { partialStreetName: searchStreetName }
        }).then((result) => {
            const match = result.body.d.find((element) => {
                const [_, suburb] = element.Value.split(', ', 2);
                return searchSuburb == suburb;
            });
            if (undefined !== match) { return match.Key }
            else { throw new UnknownStreetError(`Could not find streetId for "${searchStreetName}, ${searchSuburb}"`); }
        });
    }

    fetchCollectionSchedule(streetId) {
        return got.post(this.apiEndpoints.fetchCollectionSchedule, {
            form: true,
            body: { streetId: streetId }
        }).then((response) => {
            return this.parseCollectionResponse(response);
        }).catch((error) => {
            console.error(error);
            throw new MissingCollectionHtmlError("Couldn't get the latest schedule from WCC");
        });
    }

    parseCollectionResponse(response) {
        var html = cheerio.load(response.body);
        if (html('#content_0_pnlMessage').length > 0) {
            return this.parseInnerCityCollection(html);
        }
        else if (html('.recycling-search-padder-content').length > 0) {
            return this.parseSuburbanCollection(html);
        }
        else {
            throw new UnknownCollectionHtmlError('Unknown collection html format');
        }
    }

    parseSuburbanCollection(html) {
        var stringDate = html('.collection-date').text().match(/(.*) \(/)[1];
        var date = moment(stringDate, 'dddd, DD MMM');

        var beforeTime = html('.collection-date .nowrap').text();
        var items = html('.collection-items li').map(function (i, item) {
            return cheerio(item).text();
        }).get();

        var collection = {
            isSame: true,
            rubbish: { date: date, time: { before: beforeTime } },
            recycling: { date: date, time: { before: beforeTime } }
        }

        collection.recycling.bin = items[1];

        return collection;
    }

}

module.exports = {
    CollectionSchedule: CollectionSchedule,
    UnknownStreetError: UnknownStreetError,
    MissingCollectionHtmlError: MissingCollectionHtmlError,
    UnknownCollectionHtmlError: UnknownCollectionHtmlError
}