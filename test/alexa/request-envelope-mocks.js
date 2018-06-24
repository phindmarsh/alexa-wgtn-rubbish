const template = {
    "version": "1.0",
    "session": {
        "new": true,
        "sessionId": "amzn1.echo-api.session.11111111-1111-1111-1111-111111111111",
        "application": {
            "applicationId": "amzn1.ask.skill.11111111-1111-1111-1111-111111111111"
        },
        "user": {
            "userId": "amzn1.ask.account.USER_ACCOUNT_ID",
            "permissions": {
                "consentToken": "CONSENT_TOKEN_VALUE"
            }
        }
    },
    "context": {
        "AudioPlayer": {
            "playerActivity": "IDLE"
        },
        "Display": {
            "token": ""
        },
        "System": {
            "application": {
                "applicationId": "amzn1.ask.skill.11111111-1111-1111-1111-111111111111"
            },
            "user": {
                "userId": "amzn1.ask.account.USER_ACCOUNT_ID",
                "permissions": {
                    "consentToken": "CONSENT_TOKEN_VALUE"
                }
            },
            "device": {
                "deviceId": "amzn1.ask.device.USER_ACCOUNT_ID",
                "supportedInterfaces": {
                    "AudioPlayer": {},
                    "Display": {
                        "templateVersion": "1.0",
                        "markupVersion": "1.0"
                    }
                }
            },
            "apiEndpoint": "https://api.amazonalexa.com",
            "apiAccessToken": "CONSENT_TOKEN_VALUE"
        }
    },
    "request": {
        "type": "IntentRequest",
        "requestId": "amzn1.echo-api.request.11111111-1111-1111-1111-111111111111",
        "timestamp": "2018-06-14T09:28:14Z",
        "locale": "en-AU",
        "intent": {
            "name": "GetCollectionScheduleIntent",
            "confirmationStatus": "NONE",
            "slots": {
                "collection_type": {
                    "name": "collection_type",
                    "confirmationStatus": "NONE"
                }
            }
        }
    }
}

module.exports = {
    complete: () => template
}

