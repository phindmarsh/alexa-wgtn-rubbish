const nock = require('nock');
const chai = require('chai');
const chaiMoment = require('chai-moment');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiMoment);
chai.use(chaiAsPromised);

nock.disableNetConnect();
