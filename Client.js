const fetch = require('node-fetch');
const {SyncWaterfallHook, AsyncSeriesWaterfallHook, MultiHook} = require('tapable');

class Client {
    constructor({plugins}) {
        const beforeHook = new SyncWaterfallHook(['options']);
        this.hooks = {
            before: beforeHook,
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
        options.method = options.method || 'GET';

        let response;

        if (this.hooks.before.isUsed()) {
            let beforeRes = this.hooks.before.call(options);
            if (beforeRes[0] && typeof beforeRes[0] === 'object') {
                options = beforeRes[0];
            }
        }

        if (this.hooks.get.before.isUsed()) {
            let beforeGetRes = await this.hooks.get.before.promise(options);
            response = beforeGetRes[1];
        }

        if (!response) {
            const {url: reqUrl, ...rest} = options;
            response = await fetch(reqUrl, rest);
            if (this.hooks.get.after.isUsed()) {
                let afterResult = await this.hooks.get.after.promise(url, rest, response.clone());
                response = afterResult[1];
            }
        }

        return response;
    }
}

module.exports = Client;
