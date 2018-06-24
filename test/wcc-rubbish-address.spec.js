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

    it('should complete a missing streetId', async () => {
        nock(testApiEndpoints.host).post(testApiEndpoints.fetchStreetId).reply(200, addressMatches.matchOne);
        const matchId = 1111;
        const address = { streetName: 'Test Street', suburb: 'Suburb' };
        const collection = new CollectionSchedule(address, apiEndpoints);
        const fullAddress = await collection.loadFullAddress(address);

        expect(fullAddress.streetId).to.be.equal(matchId);
    });

    it('should fetch a matching streetId', async () => {
        nock(testApiEndpoints.host).post(testApiEndpoints.fetchStreetId).reply(200, addressMatches.matchOne);
        const matchId = 1111;
        const address = { streetName: 'Test Street', suburb: 'Suburb' };
        const collection = new CollectionSchedule(address, apiEndpoints);
        const streetId = await collection.fetchStreetId(address.streetName, address.suburb);

        expect(streetId).to.be.equal(matchId);
    });

    it('should find the correct streetId for a street with multiple suburbs', async () => {
        nock(testApiEndpoints.host).post(testApiEndpoints.fetchStreetId).reply(200, addressMatches.matchTwo);
        const matchId = 2222;
        const address = { streetName: 'Test Street', suburb: 'Nextburb' };
        const collection = new CollectionSchedule(address, apiEndpoints);
        const streetId = await collection.fetchStreetId(address.streetName, address.suburb);

        expect(streetId).to.be.equal(matchId);
    });

    it('should throw an error when no results are returned', async () => {

        nock(testApiEndpoints.host).post(testApiEndpoints.fetchStreetId).reply(200, addressMatches.matchNone);

        const address = { streetName: 'Test Street', suburb: 'Nextburb' };
        const collection = new CollectionSchedule(address, apiEndpoints);
        const result = collection.fetchStreetId(address.streetName, address.suburb);

        expect(result).to.be.rejectedWith(UnknownStreetError);
    });

    it('should throw an error when the suburb doesn\'t match', async () => {

        nock(testApiEndpoints.host).post(testApiEndpoints.fetchStreetId).reply(200, addressMatches.matchOne);

        const address = { streetName: 'Test Street', suburb: 'Noneburb' };
        const collection = new CollectionSchedule(address, apiEndpoints);
        const result = collection.fetchStreetId(collection.streetName, collection.suburb);

        expect(result).to.be.rejectedWith(UnknownStreetError);
    });

});
