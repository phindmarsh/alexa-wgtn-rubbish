const expect = require('chai').expect;
const moment = require('moment');
const { ResponseGenerator } = require('../lib/response-generator');

const messages = {
    SUBURBAN_RESPONSES: ["$bin out $date by $time"],
    OUT_QUICK_RESPONSES: ["quick, $bin out today by $time"],
}

function getSuburbanSchedule(from){
    return { 
        isSuburban: true,
        rubbish: { fromDate: moment(from) },
        recycling: { fromDate: moment(from), bin: 'Glass crate' } 
    }
}

describe('Respone Generator', () => {

    it('should generate a response for today', () => {

        const now = moment('2018-06-19T00:00:00.000');
        const schedule = getSuburbanSchedule("2018-06-19T08:00:00.000");

        const generator = new ResponseGenerator(schedule, messages)
        const response = generator.generate(now);

        expect(response).to.be.equal("quick, Glass crate out today by 8:00 am");
    });

    it('should generate a response for tomorrow', () => {

        const now = moment('2018-06-28T00:00:00.000');
        const schedule = getSuburbanSchedule("2018-06-29T08:00:00.000");

        const generator = new ResponseGenerator(schedule, messages)
        const response = generator.generate(now);

        expect(response).to.be.equal("Glass crate out tomorrow by 8:00 am");
    });

    it('should generate a response for future day in same week', () => {

        const now = moment('2018-06-26T00:00:00.000');
        const schedule = getSuburbanSchedule("2018-06-29T08:00:00.000");

        const generator = new ResponseGenerator(schedule, messages)
        const response = generator.generate(now);

        expect(response).to.be.equal("Glass crate out on Friday by 8:00 am");
    });

    it('should generate a response for future day next week', () => {

        const now = moment('2018-06-21T00:00:00.000');
        const schedule = getSuburbanSchedule("2018-06-27T08:00:00.000");

        const generator = new ResponseGenerator(schedule, messages)
        const response = generator.generate(now);

        expect(response).to.be.equal("Glass crate out on Wednesday by 8:00 am");
    });

    it('should generate a response for future day over a week away', () => {

        const now = moment('2018-06-19T00:00:00.000');
        const schedule = getSuburbanSchedule("2018-06-27T08:00:00.000");

        const generator = new ResponseGenerator(schedule, messages)
        const response = generator.generate(now);

        expect(response).to.be.equal("Glass crate out on Wednesday, 27 June by 8:00 am");
    });

    it('should generate a response for same day next week', () => {

        const now = moment('2018-06-19T00:00:00.000');
        const schedule = getSuburbanSchedule("2018-06-27T08:00:00.000");

        const generator = new ResponseGenerator(schedule, messages)
        const response = generator.generate(now);

        expect(response).to.be.equal("Glass crate out on Wednesday, 27 June by 8:00 am");
    });

});