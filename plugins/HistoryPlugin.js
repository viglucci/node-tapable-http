
class HistoryPlugin {

    constructor(container) {
        this.container = container;
    }

    apply(client) {
        client.hooks.get.after.tapPromise('HistoryPlugin', async (url, options, responseClone) => {
            this.container.push({
                url,
                options,
                responseClone
            });
        });
    }
}

module.exports = HistoryPlugin;
