const messages = require('../lang/en');

module.exports = {
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