const jwt = require('jsonwebtoken');
const db = require("../models");
const ActivityList = db.activitylist;
const User = db.user;
// called whenever a message is to be emitted to all sockets for a user
// does a little clean up on the wsClients that may have been disconnected
// Send the todo to each of the clients that a user is connected to
exports.emitUserMessage = (userId, data, wsClients) => {

    if (wsClients) {

        // remove any expired clients
        wsCleanUp(wsClients);

        // find all of the user's connections and send the todo to each
        const clientLength = wsClients.length();
        for (let i = 0; i < clientLength; i++){

            // get the username from the data and find the user and activity list records
            const client = wsClients.get(i);
            const wsId = client.userId;
            if (userId == wsId) {

                // send the message to each connection point for this user
                client.ws.send(JSON.stringify(data));      
            }
        }
    }
     
}

// disconnects expired clients and removes them from the client list
function wsCleanUp (wsClients) {
    for (let i = wsClients.length() - 1; i >= 0; i--){
        const client = wsClients.get(i);
        const token = client.token;
        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) =>  {
            if (err) {
                const ws = client.ws;
                if (ws) {
                    ws.send("Your authorization is no longer valid. Please login again");
                    ws.close();
                }
                wsClients.delete(ws);
            }
        });
    }
}