module.exports = {
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

    SUBURBAN_RESPONSES: [
        "put out your $bin $date by $time",
        "$date, put out your $bin by $time",
        "your $bin needs to be out by $time $date"
    ],
    OUT_QUICK_RESPONSES: [
        'quick, put your $bin out before $time today!',
        'your $bin needs to be out before $time today'
    ],
    MISSED_TODAY_RESPONSES: [
        'bummer, your $bin was supposed to be out before $time today',
    ]
};