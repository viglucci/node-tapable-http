const fetch = require('node-fetch');
const { SyncHook }  = require('tapable');

class Client {
    constructor({
        plugins
    }) {
        this.hooks = {
            before: new SyncHook(['options'])
        };
        if (plugins) {
            plugins.forEach(plugin => {
                plugin.apply(this.hooks);
            });
        }
    }

    async get(url, options) {
        options = options || {};
        options.url = url;
        const _options = this.hooks.before.call(options);
        if (_options) { options = _options; }
        const { url: reqUrl, ...rest } = options;
        return fetch(reqUrl, rest);
    }
}

module.exports = Client;
