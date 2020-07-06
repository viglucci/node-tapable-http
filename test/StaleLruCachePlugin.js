const nock = require('nock');
const {expect} = require('chai');
const Client = require('../Client');
const StaleLruCachePlugin = require('../plugins/StaleLruCachePlugin');
const SimpleAuthPlugin = require('../plugins/SimpleAuthPlugin');

describe('StaleLruCachePlugin', () => {

    it('returns the cached value on subsequent requests', async function () {
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
                new SimpleAuthPlugin('SOME_PASSWORD'),
                new StaleLruCachePlugin()
            ]
        });

        // request executed on first invocation
        const response = await client.get('http://example.com/example-endpoint');
        const {foo} = await response.json();
        expect(foo).to.equal('bar');

        // cache value retrieved
        const response2 = await client.get('http://example.com/example-endpoint');
        const {foo: foo2} = await response2.json();
        expect(foo2).to.equal('bar');

        // cache value retrieved
        const response3 = await client.get('http://example.com/example-endpoint');
        const {foo: foo3} = await response3.json();
        expect(foo3).to.equal('bar');

        expect(nock.isDone(), 'Expected all nock interceptors to have been called.').to.be.true;
    });
});
