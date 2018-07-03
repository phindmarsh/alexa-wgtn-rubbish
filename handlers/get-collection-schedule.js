const PERMISSIONS = [process.env.ALEXA_PERMISSIONS_GRANT];
const GCP_GEOCODE_API_KEY = process.env.GCP_GEOCODE_API_KEY

const messages = require('../lang/en');

const { CollectionSchedule, UnknownStreetError, UnknownCollectionHtmlError } = require('../lib/wcc-rubbish');
const { DeviceAddressHelper, MissingDeviceAddressError, DeviceAddressPermissionsNotEnabledError } = require('../lib/device-address-helper');
const { ResponseGenerator } = require('../lib/response-generator');

const googleMapsClient = require('@google/maps').createClient({
    key: GCP_GEOCODE_API_KEY, 
    Promise: Promise
});

module.exports = {
    canHandle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;
        return request.type === 'IntentRequest'
            && request.intent.name === 'GetCollectionScheduleIntent';
    },
    async handle(handlerInput) {
        const { requestEnvelope, serviceClientFactory, responseBuilder } = handlerInput;

        try {

            var attributes = await handlerInput.attributesManager.getPersistentAttributes();

            if(!attributes.hasOwnProperty('address') || typeof attributes.address !== 'object') {
                const deviceHelper = new DeviceAddressHelper(serviceClientFactory, googleMapsClient);
                attributes['address'] = await deviceHelper.getDeviceAddress(requestEnvelope);
            }

            console.log('Collection Address:', attributes['address']);

            const collection = new CollectionSchedule(attributes['address']);
            const schedule = await collection.loadSchedule();

            attributes['address'] = collection.address;
            handlerInput.attributesManager.setPersistentAttributes(attributes);
            await handlerInput.attributesManager.savePersistentAttributes();

            const generator = new ResponseGenerator(schedule, messages);

            return responseBuilder.speak(generator.generate()).getResponse();
        }
        catch (error) {
            console.error(error);
            if(error instanceof DeviceAddressPermissionsNotEnabledError){
                return responseBuilder
                    .speak(messages.NOTIFY_MISSING_PERMISSIONS)
                    .withAskForPermissionsConsentCard(PERMISSIONS)
                    .getResponse();
            }
            else if(error instanceof MissingDeviceAddressError) {
                return responseBuilder.speak(messages.NO_ADDRESS).getResponse();
            }
            else if (error instanceof UnknownCollectionHtmlError) {
                return responseBuilder.speak(messages.UNKNOWN_SCHEDULE_FORMAT).getResponse();
            }
            else if (error instanceof UnknownStreetError) {
                return responseBuilder.speak(messages.MISSING_STREET_ERROR).getResponse();
            }
            else {
                return responseBuilder.speak(messages.ERROR).getResponse();
            }
        }
    }
}