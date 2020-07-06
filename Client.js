const fetch = require('node-fetch');
const { SyncHook, AsyncSeriesWaterfallHook } = require('tapable');

class Client {
    constructor({
        plugins
    }) {
        this.hooks = {
            before: new SyncHook(['options']),
            get: {
                before: new AsyncSeriesWaterfallHook(['url', 'options']),
                after: new AsyncSeriesWaterfallHook(['url', 'options', 'response'])
            }
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

        const _options = await this.hooks.get.before.promise(options);

        if (_options && typeof options === 'object') { options = _options; }
      
        const {url: reqUrl, ...rest} = options;

        let res = await this.hooks.get.before.promise(url, rest);

        if (!res) {
            console.log(reqUrl, rest);
            res = await fetch(reqUrl, rest);
            res = await this.hooks.get.after.promise(url, rest, res);
        }

        return res;
    }
}

module.exports = Client;
