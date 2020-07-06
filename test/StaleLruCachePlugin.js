const nock = require('nock');
const {expect} = require('chai');
const Client = require('../Client');
const StaleLruCachePlugin = require('../plugins/StaleLruCachePlugin');

describe.only('StaleLruCachePlugin', () => {

    it('returns the cached value on subsequent requests', async function () {
        nock('http://example.com')
            .get('/example-endpoint')
            .reply(200, {
                foo: 'bar'
            })
            .get('/example-endpoint')
            .reply(200, {
                foo: 'bar 2'
            });

        const client = new Client({
            plugins: [
                new StaleLruCachePlugin()
            ]
        });

        const response = await client.get('http://example.com/example-endpoint');
        const {foo} = await response.json();
        expect(foo).to.equal('bar');

        const response2 = await client.get('http://example.com/example-endpoint');
        const {foo: foo2} = await response2.json();
        expect(foo2).to.equal('bar');

        expect(nock.isDone(), 'Expected all nock interceptors to have been called.').to.be.true;
    });
});
