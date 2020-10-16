const nock = require('nock');
const {expect} = require('chai');
const Client = require('../Client');
const HistoryPlugin = require('../plugins/HistoryPlugin');

describe('HistoryPlugin', () => {

    it('records the http requests in the history container', async function () {
        const scope = nock('http://example.com')
            .get('/example-endpoint')
            .reply(200, {
                foo: 'bar'
            })
            .get('/example-endpoint-1')
            .reply(200, {
                foo: 'baz'
            });

        const historyContainer = [];

        const client = new Client({
            plugins: [
                new HistoryPlugin(historyContainer)
            ]
        });

        const response = await client.get('http://example.com/example-endpoint');
        const json = await response.json();

        const response2 = await client.get('http://example.com/example-endpoint-1');
        const json2 = await response2.json();

        expect(historyContainer.length).to.equal(2);

        expect((await historyContainer[0].json()).foo).to.equal(json.foo);
        expect((await historyContainer[1].json()).foo).to.equal(json2.foo);

        expect(scope.isDone(), 'Expected all nock interceptors to have been called.').to.be.true;
    });
});
