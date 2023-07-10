const db = require("../models");
const Room = db.room;
const User = db.user;
const ChatMessage = db.chatmessage;
const Op = db.Sequelize.Op;

// this handles the messages in a room

// add a message to a room (current user must be in the room) [POST] /api/rooms/messages roomname message
exports.addMessage = async (req, res) => {

    try {

        const roomName = req.body.roomname;
        const message = req.body.message;
        // check that room exits
        if (!roomName)
            return res.status(400).send({msg: "A room name must be provided"});
        const room = await Room.findOne({where: {roomname: roomName}});
        if (!room) 
            return res.status(400).send({msg: "A room named '" + roomName + "' does not exist"});

        // check that the message exists
        if (!message) 
            return res.status(400).send({msg: "A nonblank message must be provided"});

        // check that current user in the room
        if (!inRoom(roomName, req.session.userId))
            return res.status(400).send({msg: "You must be in room '" + roomName + "' to post a message there "});
        
        // get the user record
        const user = await User.findByPk(req.session.userId);
        if (!user) 
            return res.status(500).send({msg: "ALERT: User with id " + req.session.id.toString() + " not found."});
       
        // add the message
        const chatMessage = await ChatMessage.create({
            username: userName,
            message: message,
            time: Date.now()
          });
        await room.addRoom_messages(chatMessage);

        return res.status(200).send({chatMessage}); 

    } catch (error) {
        return res.status(500).send({msg: error.message});
    }

}
// delete old messages from a room (admin - may include a date, default is 30 days) [DELETE] /api/rooms/cleanup (date)
exports.cleanupRoom = async (req, res) => {

    try {
        return res.status(500).send({msg: "This function is not implemented"})

        // check that room exits

        // check that current user is admin or is moderator or the room

        // destroy all messages in the room with a date prior to the one provided (or 30 days or older)

    } catch (error) {
        return res.status(500).send({msg: error.message});
    }

}

// delete all messages from a particular user from a room (admin and moderator) [DELETE] /api/rooms/user roomname username
exports.deleteUserMessages = async (req, res) => {

    try {

        return res.status(500).send({msg: "This function is not implemented"})
        // check that room exits

        // check that the user exits

        // check that current user is admin or is moderator or the room

        // destroy all messages in the room for the named user

        // send a message to all online users with a deletion message and the new contents of the room
        const list = getMessages(roomname);

    } catch (error) {
        return res.status(500).send({msg: error.message});
    }

}


// delete a message from a room (admin and moderator) [DELETE] /api/rooms/message roomname messageObject
exports.deleteMessage = async (req, res) => {

    try {

        return res.status(500).send({msg: "This function is not implemented"})
        // check that room exits

        // check that the message exists

        // check that current user a moderator of the room

        // delete the message

        // send a message to all online users with a deletion message and the new contents of the room
        const list = getMessages(roomname);

    } catch (error) {
        return res.status(500).send({msg: error.message});
    }

}

// list all messages in a room [GET] /api/rooms/messages roomname (user must be in the room)
exports.listMessages = async (req, res) => {

    try {

        return res.status(500).send({msg: "This function is not implemented"})
        // check that room exits

        // check that the user is in the room

        // list all messages in the room
        const list = getMessages(roomname);

    } catch (error) {
        return res.status(500).send({msg: error.message});
    }

}

// help function
// get the entire contents of all messages in a room
async function getMessages (roomname) {
    return [];
}

// see if a user is in a room
async function inRoom (roomName, userId) {
    const roomUsers = await Room.getRooms_users ({where:{roomname: roomName}});
    for (let i = 0; i < roomUsers.length; i++) {
        if (roomUsers[i].id == userId)
            return true;
    }
    return false;   
}