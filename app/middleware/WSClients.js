// this class handers the WebSocket clients for a WebSocket Server

exports.WSClients = class {
    #name = 'WSClients';
    #clients = [];
    #server = null;
    constructor(wsServer) {
        this.#server = wsServer;
    }
    
    add (socket, token, userId ) {
        this.#clients.push({token: token, ws:socket, userId: userId});
    }

    get (i) {
        return this.#clients[i];
    }

    length() {
        return this.#clients.length;
    }

    find (token) {
        for (let i = 0; i < this.#clients.length; i++) {
            if (this.#clients[i].token == token) {
                return this.#clients[i];
            }
        }
        return null;
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