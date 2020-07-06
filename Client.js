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
            let beforeResult = this.hooks.before.call(options);
            if (beforeResult[0] && typeof beforeResult[0] === 'object') {
                options = beforeResult[0];
            }
        }

        if (this.hooks.get.before.isUsed()) {
            let beforeGetResult = await this.hooks.get.before.promise(options);
            response = beforeGetResult[1];
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
