class SimpleAuthPlugin {

    constructor(password) {
        this.password = password;
    }

    apply(hooks) {
        hooks.before.tap('SimpleAuthPlugin', (options) => {
            options.headers = {
                ...(options.headers || {}),
                authorization: this.password
            };
        });
    }
}

module.exports = SimpleAuthPlugin;
