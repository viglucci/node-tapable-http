const nock = require('nock');
const {expect} = require('chai');
const _ = require('lodash');
const Client = require('../Client');
const ClientCredentialsAuthPlugin = require('../plugins/ClientCredentialsAuthPlugin');

describe('ClientCredentialsAuthPlugin', () => {

    it('decorates the request with an authorization header with the value of a bearer token', async function () {

        const clientId = '01234';
        const clientSecret = '56789';
        const CLIENT_CREDS_BASIC_AUTH_VALUE = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

        // interceptor for oauth token request
        nock('http://oauth.example.com', {
                reqheaders: {
                    accept: 'application/json',
                    authorization: `Basic ${CLIENT_CREDS_BASIC_AUTH_VALUE}`,
                    "content-type": "application/json",
                }
            })
            .post('/token', _.matches({
                grant_type: 'client_credentials',
                scope: 'scopeA,scopeB'
            }))
            .reply(200, {
                access_token: 'USVb1nGO9kwQlhNRRnI4iWVy2UV5j7M6h7',
                token_type: 'bearer',
                expires_in: 86399
            });

        // interceptor for HTTP GET to resource
        nock('http://example.com', {
                reqheaders: {
                    authorization: 'Bearer USVb1nGO9kwQlhNRRnI4iWVy2UV5j7M6h7',
                }
            })
            .get('/example-endpoint')
            .reply(200, {
                foo: 'bar'
            });

        const client = new Client({
            plugins: [
                new ClientCredentialsAuthPlugin({
                    auth: {
                        tokenHost: 'http://oauth.example.com',
                        tokenPath: '/token'
                    },
                    client: {
                        id: '01234',
                        secret: '56789'
                    },
                    scope: "scopeA,scopeB"
                })
            ]
        });

        const response = await client.get('http://example.com/example-endpoint');
        const {foo} = await response.json();

        expect(foo).to.equal('bar');
        expect(nock.isDone(), 'Expected all nock interceptors to have been called.').to.be.true;
    });
});
