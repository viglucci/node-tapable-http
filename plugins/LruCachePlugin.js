const Cache = require('stale-lru-cache');

class LruCachePlugin {

    constructor({
        maxSize = 100,
        maxAge = 600
    } = {}) {
        this.cache = new Cache({
            maxSize,
            maxAge,
            staleWhileRevalidate: 0
        });
    }

    apply(client) {
        const originalGet = client.get.bind(client);
        client.get = async (url, options) => {
            let response;
            if (this.cache.has(url)) {
                const cachedResponse = this.cache.get(url);
                response = cachedResponse.clone();
            } else {
                response = await originalGet(url, options);
                this.cache.set(url, response.clone());
                response = response.clone();
            }
            return response;
        };
    }
}

module.exports = LruCachePlugin;
