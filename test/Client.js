const nock = require('nock');
const {expect} = require('chai');
const Client = require('../Client');
const SimpleAuthPlugin = require('../plugins/SimpleAuthPlugin');

describe('Client', () => {

    it('decorates the request with an authorization header', async function () {
        nock('http://example.com', {
                reqheaders: {
                    authorization: 'SOME_PASSWORD',
                }
            })
            .get('/example-endpoint')
            .reply(200, {
                foo: 'bar'
            });

        const client = new Client({
            plugins: [
                new SimpleAuthPlugin('SOME_PASSWORD')
            ]
        });

        const response = await client.get('http://example.com/example-endpoint');
        const {foo} = await response.json();

        expect(foo).to.equal('bar');
        expect(nock.isDone(), 'Expected all nock interceptors to have been called.').to.be.true;
    });
});
