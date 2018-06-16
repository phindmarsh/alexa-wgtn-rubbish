const expect = require('chai').expect;

const fs = require('fs');
const cheerio = require('cheerio');
const moment = require('moment');
const { CollectionSchedule } = require('../lib/wcc-rubbish');

describe('Suburban Collection HTML', () => {

    it('should parse rubbish', () => {
        var html = cheerio.load(fs.readFileSync(__dirname + '/nock/suburban-collection-wheeliebin.html'));

        var collection = new CollectionSchedule('Test Street', 'Suburb');
        var response = collection.parseSuburbanCollection(html);

        expect(response.rubbish).to.exist;
    });

    it('should parse wheelie bin', () => {
        var html = cheerio.load(fs.readFileSync(__dirname + '/nock/suburban-collection-wheeliebin.html'));

        var collection = new CollectionSchedule('Test Street', 'Suburb');
        var response = collection.parseSuburbanCollection(html);

        expect(response.recycling.bin).to.have.string('Wheelie bin');
    });

    it('should parse glass crate', () => {
        var html = cheerio.load(fs.readFileSync(__dirname + '/nock/suburban-collection-glass.html'));

        var collection = new CollectionSchedule('Test Street', 'Suburb');
        var response = collection.parseSuburbanCollection(html);

        expect(response.recycling.bin).to.have.string('Glass crate');
    });

    it('should parse the collection date', () => {
        var html = cheerio.load(fs.readFileSync(__dirname + '/nock/suburban-collection-wheeliebin.html'));

        var collection = new CollectionSchedule('Test Street', 'Suburb');
        var response = collection.parseSuburbanCollection(html);

        expect(response.rubbish.date).to.be.sameMoment(moment('Monday, 18 June', 'dddd, DD MMM'));
    });

    it('should parse the before time', () => {
        var html = cheerio.load(fs.readFileSync(__dirname + '/nock/suburban-collection-wheeliebin.html'));

        var collection = new CollectionSchedule('Test Street', 'Suburb');
        var response = collection.parseSuburbanCollection(html);

        expect(response.rubbish.time.before).to.equal('8.00 am');
    });

});