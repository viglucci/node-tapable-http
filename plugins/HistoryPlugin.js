
class Transaction {
    static create({
        url,
        options,
        response
    }) {
        return new Transaction(url, options, response);
    }

    constructor(url, options, response) {
        this._url = url;
        this._options = options;
        this._response = response;
    }

    getUrl() {
        return this._url;
    }

    getOptions() {
        return this._options;
    }

    getResponse() {
        return this._response;
    }

    async json() {
        return this._response.clone().json();
    }

    async text() {
        return this._response.clone().text();
    }
}

class HistoryPlugin {

    constructor(container) {
        this.container = container;
    }

    apply(client) {
        client.hooks.get.after.tapPromise('HistoryPlugin', async (url, options, responseClone) => {
            const transaction = Transaction.create({
                url,
                options,
                response: responseClone
            });
            this.container.push(transaction);
        });
    }
}

module.exports = HistoryPlugin;
