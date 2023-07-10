const jwt = require('jsonwebtoken');
const db = require("../models");
const ActivityList = db.activitylist;
const User = db.user;
// called whenever a 'todo' signal is received
// does a little clean upp on the wsClients that may have been disconnected
// Send the todo to each of the clients that a user is connected to
exports.emitToDos = async (userName, data, wsClients) => {

    const user = await Room.findOne ({where: {username: userName}});
    if (!user) {
        console.log("user ", userName, " not found");
        return;
    }

    // find all of the user's connections and send the todo to each
    for (const [token, client] of Object.entries(wsClients)) {
        jwt.verify(token, process.env.SECERT_KEY, (err, decoded) =>  {
            if (err) {
                client.ws.send({msg: "Your authorization is no longer valid. Please login again"});
                client.ws.close();
                wsClients.delete(ws);
            } else {
    
                // get the username from the data and find the user and activity list records
                const wsUserName = client.wsUserName;
                if (userName == wsUserName) {

                    // send the message to each connection poitn for this user
                    ws.emit("todos", data);      
                }
            }
        });
    }
     
}