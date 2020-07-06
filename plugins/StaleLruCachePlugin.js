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
        
    }
}

module.exports = StaleLruCachePlugin;
