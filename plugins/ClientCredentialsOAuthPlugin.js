const { ClientCredentials } = require('simple-oauth2');

class ClientCredentialsOAuthPlugin {

    constructor({
        auth = {},
        client = '',
        scope = '',
        requestOptions = {}
    }) {
        requestOptions = {
            ...requestOptions,
            bodyFormat: requestOptions.bodyFormat || 'json'
        };
        auth.tokenPath = auth.tokenPath || '/oauth/token';
        this.client = new ClientCredentials({
            auth,
            client,
            options: requestOptions
        });
        this.scope = scope;
        this.accessToken = null;
    }

    apply(client) {
        client.hooks.before.tapPromise('ClientCredentialsOAuthPlugin', async (options) => {
            if (this.accessToken && !this.accessToken.expired()) {
                return [{
                    ...options,
                    headers: {
                        ...(options.headers || {}),
                        authorization: `Bearer ${this.accessToken.access_token}`
                    }
                }];
            }
            const { token } = await this.client.getToken({
                scope: this.scope
            });
            this.accessToken = token;
            return [{
                ...options,
                headers: {
                    ...(options.headers || {}),
                    authorization: `Bearer ${this.accessToken.access_token}`
                }
            }];
        });
    }
}

module.exports = ClientCredentialsOAuthPlugin;
