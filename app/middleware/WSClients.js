// this class handers the WebSocket clients for a WebSocket Server

exports.WSClients = class {
    #name = 'WSClients';
    #clients = [];
    #server = null;
    constructor(wsServer) {
        this.#server = wsServer;
    }

    add (socket, token, userName ) {
        this.#clients[token] = {ws:socket, wsUsername: userName}
    }

    find (token) {
        return this.#clients[token];
    }

    delete (ws) {
        for (let i = 0; i < this.#clients.length; i++) {
            if (this.#clients[i].ws == ws) {
                this.#clients.splice(i, 1);
              break;
            }
        }
    }
}