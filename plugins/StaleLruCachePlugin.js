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
        hooks.get.before.tapPromise('StaleLruCachePlugin', async (url, options) => {
            if (this.cache.has(url)) {
                return this.cache.get(url);
            }
            return null;
        });
        hooks.get.after.tapPromise('StaleLruCachePlugin', async (url, options, response) => {
            this.cache.set(url, response.clone());
            return response;
        });
    }
}

module.exports = StaleLruCachePlugin;
