class SimpleAuthPlugin {

    constructor(password) {
        this.password = password;
    }

    apply(client) {
        client.hooks.before.tap('SimpleAuthPlugin', (options) => {
            const res = [{
                ...options,
                headers: {
                    ...(options.headers || {}),
                    authorization: this.password || ""
                }
            }];
            return res;
        });
    }
}

module.exports = SimpleAuthPlugin;
