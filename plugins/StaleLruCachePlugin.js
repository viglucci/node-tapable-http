const Cache = require('stale-lru-cache');

class StaleLruCachePlugin {

    constructor() {
        this.cache = new Cache({
            maxSize: 100,
            maxAge: 600,
            staleWhileRevalidate: 86400
        });
    }

    apply(hooks) {

        hooks.get.before.tapPromise('StaleLruCachePlugin', async (options) => {
            const url = options.url;
            if (this.cache.has(url)) {
                const response = this.cache.get(url);
                return [options, response.clone()];
            }
            return [options];
        });

        hooks.get.after.tapPromise('StaleLruCachePlugin', async (url, options, response) => {
            this.cache.set(url, response.clone());
            return [options, response.clone()];
        });
    }
}

module.exports = StaleLruCachePlugin;
