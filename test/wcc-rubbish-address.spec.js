const expect = require('chai').expect;
const nock = require('nock');
const { CollectionSchedule, UnknownStreetError } = require('../lib/wcc-rubbish');
const addressMatches = require('./nock/address-matches');

const testApiEndpoints = {
    host: 'https://example.com',
    fetchStreetId: '/streetId',
    fetchCollectionSchedule: '/collectionSchedule'
}

const apiEndpoints = {
    fetchStreetId: testApiEndpoints.host + testApiEndpoints.fetchStreetId,
    fetchCollectionSchedule: testApiEndpoints.host + testApiEndpoints.fetchCollectionSchedule
}

describe('Get Street ID', () => {

    it('should fetch a matching streetId', async () => {
        nock(testApiEndpoints.host).post(testApiEndpoints.fetchStreetId).reply(200, addressMatches.matchOne);
        var matchId = 1111;
        var collection = new CollectionSchedule('Test Street', 'Suburb', apiEndpoints);
        var streetId = await collection.fetchStreetId(collection.streetName, collection.suburb);

        expect(streetId).to.be.equal(matchId);
    });

    it('should find the correct streetId for a street with multiple suburbs', async () => {
        nock(testApiEndpoints.host).post(testApiEndpoints.fetchStreetId).reply(200, addressMatches.matchTwo);
        var matchId = 2222;
        var collection = new CollectionSchedule('Test Street', 'Nextburb', apiEndpoints);
        var streetId = await collection.fetchStreetId(collection.streetName, collection.suburb);

        expect(streetId).to.be.equal(matchId);
    });

    it('should throw an error when no results are returned', async () => {

        nock(testApiEndpoints.host).post(testApiEndpoints.fetchStreetId).reply(200, addressMatches.matchNone);

        var collection = new CollectionSchedule('Test Street', 'Nextburb', apiEndpoints);
        var result = collection.fetchStreetId(collection.streetName, collection.suburb);

        expect(result).to.be.rejectedWith(UnknownStreetError);
    });

    it('should throw an error when the suburb doesn\'t match', async () => {

        nock(testApiEndpoints.host).post(testApiEndpoints.fetchStreetId).reply(200, addressMatches.matchOne);

        var collection = new CollectionSchedule('Test Street', 'Noneburb', apiEndpoints);
        var result = collection.fetchStreetId(collection.streetName, collection.suburb);

        expect(result).to.be.rejectedWith(UnknownStreetError);
    });

});
