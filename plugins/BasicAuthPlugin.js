class BasicAuthPlugin {

    constructor({
        username,
        password
    }) {
        this.username = username || "";
        this.password = password || "";
    }

    apply(client) {
        client.hooks.before.tap('BasicAuthPlugin', (options) => {
            const auth = this.getBasicAuthValue();
            return [{
                ...options,
                headers: {
                    ...(options.headers || {}),
                    authorization: `Basic ${auth}`
                }
            }];
        });
    }

    getBasicAuthValue() {
        const auth = `${this.username}:${this.password}`;
        return Buffer.from(auth).toString('base64');
    }
}

module.exports = BasicAuthPlugin;
