require('./setup.spec');

const expect = require('chai').expect;
const nock = require('nock');
const { DeviceAddressHelper } = require('../lib/device-address-helper');
const { ServiceClientFactoryMock } = require('./alexa/service-client-factory-mock');
const requestEnvelopes = require('./alexa/request-envelope-mocks');

describe('Device Address Helper', () => {

    it('should geocode device address', () => {

        const requestEnvelope = requestEnvelopes.complete();
        nock('https://maps.googleapis.com')
            .get('/maps/api/geocode/json')
            .replyWithFile(200, __dirname + '/nock/gcp-geocode-result.json');

        const helper = new DeviceAddressHelper(new ServiceClientFactoryMock('foo'));
        const result = helper.getDeviceAddress(requestEnvelope);

    });

})