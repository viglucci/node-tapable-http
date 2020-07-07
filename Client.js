const fetch = require('node-fetch');
const {SyncWaterfallHook, AsyncSeriesWaterfallHook, MultiHook} = require('tapable');

class Client {
    constructor({plugins}) {
        this.hooks = {
            before: new SyncWaterfallHook(['options']),
            get: {
                before: new AsyncSeriesWaterfallHook(['url', 'options']),
                after: new AsyncSeriesWaterfallHook(['url', 'options', 'response'])
            }
        };
        if (plugins) {
            plugins.forEach(plugin => {
                plugin.apply(this);
            });
        }
    }

    async get(url, options) {
        options = options || {};
        options.url = url;
        options.method = 'GET';

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
            const {url: reqUrl, ...otherOpts} = options;
            response = await fetch(reqUrl, otherOpts);
            if (this.hooks.get.after.isUsed()) {
                let afterResult = await this.hooks.get.after.promise(url, otherOpts, response.clone());
                response = afterResult[1];
            }
        }

        return response;
    }
}

module.exports = Client;
