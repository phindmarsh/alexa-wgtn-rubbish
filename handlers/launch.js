const messages = require('../lang/en');

module.exports = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(messages.LAUNCH)
            .reprompt(messages.LAUNCH)
            .getResponse();
    },
};
