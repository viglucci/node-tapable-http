class SimpleAuthPlugin {

    constructor(password) {
        this.password = password;
    }

    apply(hooks) {
        hooks.before.tap('SimpleAuthPlugin', (options) => {
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
