/**
 * Suburban: 
 * (On Tuesday|Tomorrow), you should put out and <bin> by <time>
 * Put out the <bin> by <time> on <date>
 * 
 */
const moment = require('moment');


class ResponseGenerator {

    constructor(schedule, messages) {
        this.schedule = schedule;
        this.messages = messages;
    }

    generate(now = moment()) {
        if(this.schedule.isSuburban){
            return this.generateSuburbanResponse(this.schedule, now);
        }
        else {
            return this.messages.ERROR;
        }
    }

    generateSuburbanResponse(schedule, now = moment()) {
        const date = schedule.recycling.fromDate;
        const time = moment(schedule.recycling.fromDate).format('h:mm a');
        const bin = schedule.recycling.bin;
        var dateText = '', phrase = '';

        if(date.isSame(now, 'day') && now.isBefore(date)) {
            phrase = this.pickRandomPhrase(this.messages.OUT_QUICK_RESPONSES);
        }
        else {
            dateText = moment(date).calendar(moment(now), {
                lastDay: "[yesterday]",
                sameDay: "[today]",
                nextDay: "[tomorrow]",
                lastWeek: "[last] dddd",
                nextWeek: "[on] dddd",
                sameElse: "[on] dddd, D MMMM"
            });
            phrase = this.pickRandomPhrase(this.messages.SUBURBAN_RESPONSES)
        }

        return phrase.replace('$date', dateText)
                    .replace('$bin', bin)
                    .replace('$time', time)
                    .trim();
    }

    pickRandomPhrase(phrases) {
        return phrases[Math.floor(Math.random() * phrases.length)];
    }

}

module.exports= {
    ResponseGenerator: ResponseGenerator
}