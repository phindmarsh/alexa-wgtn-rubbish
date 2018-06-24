'use strict';

const alexa = require('ask-sdk-core');
const skillBuilder = alexa.SkillBuilders.custom();
const {DynamoDbPersistenceAdapter} = require('ask-sdk-dynamodb-persistence-adapter');
const persistenceAdapter = new DynamoDbPersistenceAdapter({ 
    tableName: process.env.DYNAMODB_TABLE,
});

exports.handler = skillBuilder
    .addRequestHandlers(
        require('./handlers/cancel'),
        require('./handlers/get-address'),
        require('./handlers/get-collection-schedule'),
        require('./handlers/help'),
        require('./handlers/stop'),
        require('./handlers/unhandled'),
        require('./handlers/session-ended')
    )
    .addErrorHandlers(require('./handlers/get-address-error'))
    .withApiClient(new alexa.DefaultApiClient())
    .withPersistenceAdapter(persistenceAdapter)
    .lambda();