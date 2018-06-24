
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
    constructor(address, apiEndpoints = API_ENDPOINTS) {
        this.address = address;
        this.apiEndpoints = apiEndpoints;
    }

    async loadSchedule() {
        this.address = await this.loadFullAddress(this.address);

        console.log(`Fetching schedule for ${this.address.streetId}`);
        this.schedule = await this.fetchCollectionSchedule(this.address.streetId);

        return this.schedule;
    }

    /**
     * WCC website requires a streetId when fetching collection schedule,
     * so fetch it if we need it
     * 
     * @param {object} address 
     */
    async loadFullAddress(address) {
        if(!address.hasOwnProperty('streetId') || !address.streetId) {
            console.log(`Fetching streetId for ${this.address.streetName}, ${this.address.suburb}`);
            address.streetId = await this.fetchStreetId(address.streetName, address.suburb);
        }

        return address;
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

    /**
     * Parse HTML for a suburban collection. In this case the rubbish is always 
     * collected with the recycling, and only the recycling bin changes each week.
     * 
     * @param {string} html 
     */
    parseSuburbanCollection(html) {
        var stringDate = html('.collection-date').text().match(/(.*) \(/)[1];
        var beforeTime = html('.collection-date .nowrap').text();
        
        var date = moment(`${stringDate} ${beforeTime}`, 'dddd, DD MMM h.mm a');
        var items = html('.collection-items li').map(function (i, item) {
            return cheerio(item).text();
        }).get();

        var collection = {
            isSuburban: true,
            rubbish: { fromDate: date },
            recycling: { fromDate: date }
        }

        // WCC website always prints rubbish collection first, 
        // so only the second index is interesting here.
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