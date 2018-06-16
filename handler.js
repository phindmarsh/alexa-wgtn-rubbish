'use strict';

const GCP_GEOCODE_API_KEY = process.env.GCP_GEOCODE_API_KEY
const PERMISSIONS = ['read::alexa:device:all:address'];

const messages = {
    WELCOME: 'Welcome to the Sample Device Address API Skill!  You can ask for the device address by saying what is my address.  What do you want to ask?',
    WHAT_DO_YOU_WANT: 'What do you want to ask?',
    NOTIFY_MISSING_PERMISSIONS: 'Please enable Location permissions in the Amazon Alexa app.',
    NO_ADDRESS: 'It looks like you don\'t have an address set. You can set your address from the companion app.',
    UNKNOWN_SCHEDULE_FORMAT: 'Sorry, I don\'t understand the schedule in your street yet',
    MISSING_STREET_ERROR: 'Sorry, I couldn\'t find your street on the Wellington City Council website',
    ERROR: 'Uh Oh. Looks like something went wrong.',
    LOCATION_FAILURE: 'There was an error with the Device Address API. Please try again.',
    GOODBYE: 'Bye!',
    UNHANDLED: 'This skill doesn\'t support that. Please ask something else.',
    HELP: 'You can use this skill by asking something like: when should I put the rubbish out?',
    STOP: 'Bye!',
};

const alexa = require('ask-sdk-core');
const googleMapsClient = require('@google/maps').createClient({
    key: GCP_GEOCODE_API_KEY, Promise: Promise
});
const { CollectionSchedule, UnknownStreetError, UnknownCollectionHtmlError } = require('./lib/wcc-rubbish');

const GetAddressIntent = {
    canHandle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;

        return request.type === 'IntentRequest' && request.intent.name === 'GetAddressIntent';
    },
    async handle(handlerInput) {
        const { requestEnvelope, serviceClientFactory, responseBuilder } = handlerInput;
        console.log(requestEnvelope);
        const consentToken = requestEnvelope.context.System.user.permissions
            && requestEnvelope.context.System.user.permissions.consentToken;
        if (!consentToken) {
            return responseBuilder
                .speak(messages.NOTIFY_MISSING_PERMISSIONS)
                .withAskForPermissionsConsentCard(PERMISSIONS)
                .getResponse();
        }
        try {
            const { deviceId } = requestEnvelope.context.System.device;
            const deviceAddressServiceClient = serviceClientFactory.getDeviceAddressServiceClient();
            const address = await deviceAddressServiceClient.getFullAddress(deviceId);

            console.log('Address successfully retrieved, now responding to user.');

            let response;
            if (address.addressLine1 === null && address.stateOrRegion === null) {
                response = responseBuilder.speak(messages.NO_ADDRESS).getResponse();
            } else {
                const ADDRESS_MESSAGE = `${messages.ADDRESS_AVAILABLE + address.addressLine1}, ${address.stateOrRegion}, ${address.postalCode}`;
                response = responseBuilder.speak(ADDRESS_MESSAGE).getResponse();
            }
            return response;
        } catch (error) {
            if (error.name !== 'ServiceError') {
                console.error(error);
                const response = responseBuilder.speak(messages.ERROR).getResponse();
                return response;
            }
            throw error;
        }
    },
};

const GetCollectionScheduleIntent = {
    canHandle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;
        return request.type === 'IntentRequest'
            && request.intent.name === 'GetCollectionScheduleIntent';
    },
    async handle(handlerInput) {
        const { requestEnvelope, serviceClientFactory, responseBuilder } = handlerInput;

        if (!checkPermissions(requestEnvelope)) {
            return responseBuilder
                .speak(messages.NOTIFY_MISSING_PERMISSIONS)
                .withAskForPermissionsConsentCard(PERMISSIONS)
                .getResponse();
        }

        const address = await getCollectionAddress(requestEnvelope, serviceClientFactory);

        console.log('Collection Address:' + address);
        try {
            const collection = new CollectionSchedule(address.streetName, address.suburb);
            const schedule = await collection.loadSchedule();

            return responseBuilder.speak('Put out your ' + schedule.recycling.bin).getResponse();
        }
        catch (error) {
            console.error(error);
            if (error instanceof UnknownCollectionHtmlError) {
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

function checkPermissions(requestEnvelope) {
    return requestEnvelope.context.System.user.permissions
        && requestEnvelope.context.System.user.permissions.consentToken;
}

async function getCollectionAddress(requestEnvelope, serviceClientFactory) {

    const consentToken = requestEnvelope.context.System.user.permissions
        && requestEnvelope.context.System.user.permissions.consentToken;
    if (!consentToken) {
        return false
    }

    const { deviceId } = requestEnvelope.context.System.device;
    const deviceAddressServiceClient = serviceClientFactory.getDeviceAddressServiceClient();
    const deviceAddress = await deviceAddressServiceClient.getFullAddress(deviceId);
    console.log('Device address', deviceAddress);

    var searchAddress = '';
    if (deviceAddress !== null) {
        searchAddress = `${deviceAddress.addressLine1}, ${deviceAddress.city}`;
    }
    else {
        return false;
    }

    const addressResults = await googleMapsClient.geocode({
        address: searchAddress,
        region: 'nz',
        components: { country: 'NZ', administrative_area: 'Wellington' }
    }).asPromise();
    const [streetName, suburb] = filterAddressParts(addressResults.json.results.pop());

    return { streetName: streetName, suburb: suburb };
}

function filterAddressParts(address) {
    console.log(address);
    const componentTypes = ['route', 'sublocality']
    return address.address_components.reduce(function (parts, part) {
        componentTypes.forEach(function (component) {
            if (part.types.includes(component)) {
                return parts.push(part.long_name);
            }
        });
        return parts;
    }, []);
}

const SessionEndedRequest = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

        return handlerInput.responseBuilder.getResponse();
    },
};

const UnhandledIntent = {
    canHandle() {
        return true;
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(messages.UNHANDLED)
            .reprompt(messages.UNHANDLED)
            .getResponse();
    },
};

const HelpIntent = {
    canHandle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;

        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(messages.HELP)
            .reprompt(messages.HELP)
            .getResponse();
    },
};

const CancelIntent = {
    canHandle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;

        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.CancelIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(messages.GOODBYE)
            .getResponse();
    },
};

const StopIntent = {
    canHandle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;

        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.StopIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(messages.STOP)
            .getResponse();
    },
};

const GetAddressError = {
    canHandle(handlerInput, error) {
        return error.name === 'ServiceError';
    },
    handle(handlerInput, error) {
        if (error.statusCode === 403) {
            return handlerInput.responseBuilder
                .speak(messages.NOTIFY_MISSING_PERMISSIONS)
                .withAskForPermissionsConsentCard(PERMISSIONS)
                .getResponse();
        }
        return handlerInput.responseBuilder
            .speak(messages.LOCATION_FAILURE)
            .reprompt(messages.LOCATION_FAILURE)
            .getResponse();
    },
};


const skillBuilder = alexa.SkillBuilders.custom();

exports.handler = skillBuilder
    .addRequestHandlers(
        GetAddressIntent,
        GetCollectionScheduleIntent,
        SessionEndedRequest,
        HelpIntent,
        CancelIntent,
        StopIntent,
        UnhandledIntent
    )
    .addErrorHandlers(GetAddressError)
    .withApiClient(new alexa.DefaultApiClient())
    .lambda();