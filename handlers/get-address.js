const GCP_GEOCODE_API_KEY = process.env.GCP_GEOCODE_API_KEY
const PERMISSIONS = [process.env.ALEXA_PERMISSIONS_GRANT];

const messages = require('../lang/en');


const { DeviceAddressHelper, MissingDeviceAddressError, DeviceAddressPermissionsNotEnabledError } = require('../lib/device-address-helper');
const googleMapsClient = require('@google/maps').createClient({
    key: GCP_GEOCODE_API_KEY, 
    Promise: Promise
});

module.exports = {
    canHandle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;

        return request.type === 'IntentRequest' && request.intent.name === 'GetAddressIntent';
    },
    async handle(handlerInput) {
        const { requestEnvelope, serviceClientFactory, responseBuilder } = handlerInput;
        
        try {
            const deviceHelper = new DeviceAddressHelper(serviceClientFactory, googleMapsClient);
            const address = await deviceHelper.getDeviceAddress(requestEnvelope);
            
            var attributes = await handlerInput.attributesManager.getPersistentAttributes();
            attributes['address'] = address;
            handlerInput.attributesManager.setPersistentAttributes(attributes);
            await handlerInput.attributesManager.savePersistentAttributes();

            const ADDRESS_MESSAGE = `${messages.ADDRESS_AVAILABLE}: ${address.streetName}, ${address.suburb}`;
            return responseBuilder.speak(ADDRESS_MESSAGE).getResponse();
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
            else {
                return responseBuilder.speak(messages.ERROR).getResponse();
            }
        }
    },
};