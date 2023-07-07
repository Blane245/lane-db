const { isModeratorOrAdmin } = require("../middleware/authJwt");
const db = require("../models");
const Room = db.room;
const User = db.user;

  // this handles the administration of chat rooms
  // only administrators and moderators to do these functions. 
  // they include
  //  delete old messages from a room (admin - may include a date, default is 30 days) [DELETE] /api/rooms/cleanup (roomname)
  //  block a user from a room (admin and moderator) [POST] /api/rooms/user/block
  //  unblock a user from a room (admin and moderator) [POST] /api/rooms/user/unblock
  //  delete a message from a room (admin and moderator) [DELETE] /api/rooms/message
  //  delete all messages from a particular user from a room (admin and moderator) [DELETE] /api/rooms/user
  //  
  // these functions are how people enter and leave rooms (user authority or higher required)
  //  request to enter a room [POST] /api/rooms/enter roomname (note no approval required)
  //  request to leave a room [POST] /api/rooms/leave roomname (user leaves all rooms they are in when disconnected)
  //  list all messages in a room [GET] /api/rooms/messages roomname (user must be in the room)  

//  create a new room (with an optional moderator) [POST] /api/rooms roomname, (moderatorname)
exports.createRoom = async (req, res) => {

    try {

        const roomname = req.body.roomname;
        const moderatorname = req.body.moderatorname;
        if (!roomname) {
            return res.status(400).send({msg: "A room name was not given"});
        }

        // if the moderator was given, check if the user record exists
        let moderator = null;
        if (moderatorname) {
            moderator = await User.findOne ({where: {username: moderatorname}});
            if (!moderator) 
                return res.status(400).send({msg: "A moderator named '"+moderatorname+"' does not exists"});
            else {
                if (!isModeratorOrAdmin(moderator.id)) 
                    return res.status(400).send({msg: "The named user '"+moderatorname+"' is not an admininstrator or moderator"});
            }

        }

        // check if room already exists
        let room = await Room.findOne({where: {roomname: roomname}});
        if (room) {
            return res.status(400).send({msg: "A room named '"+roomname+"' already exists"});
        } else {
            room = await Room.create({roomname: roomname});
            if (moderator) 
                await Room.addModertors_rooms (moderator.id);
            return res.status(200).send({msg: "Room '" + room.roomname+"' has been created"});
        }
    } catch (error) {
        return res.status(500).send({msg: error.message});
    }
    
}

//  delete a room (admin only) [DELETE] /api/rooms roomname
exports.deleteRoom = async (req, res) => {

    try {

        const roomname = req.body.roomname;
        if (!roomname) {
            return res.status(400).send({msg: "A room name was not given"});
        }
        // check if room exists
        let room = await Room.findOne({where: {roomname: roomname}});
        if (room) {
            Room.destory({where: {roomname: roomname}});
            return res.status(200).send({msg: "A room named '"+roomname+"' has been destroyed"});
        } else {
            return res.status(400).send({msg: "Room '" + room.roomname+"' does not exist"});
        }
    } catch (error) {
        return res.status(500).send({msg: error.message});
    }
    
}
  
//  list all rooms (and their moderators) (admin only) [GET] /api/rooms
//  list a moderator's rooms (moderator only) [GET] /api/rooms
exports.listRooms = async (req, res) => {

    try {

        const Admin = await isAdmin (req.userId);
        if (Admin) {
            const rooms = await Room.findAll ({});
            if (!rooms ) {
                return res.status(400).send({msg: "There are no rooms"});              
            } else {
                const bundle = []
                for (let i = 0; i < rooms.length; i++) {
                    const moderators = Room.getRooms_moderators();
                    if (!moderators) moderators = [];
                    bundle.push ({room: rooms[i], moderators: moderators})
                }
            }
        }
        else {
            const rooms = await Room.get.Moderators_rooms ({where: {id: req.userId}});
            if (!rooms ) {
                return res.status(400).send({msg: "You do not moderate any rooms"});              
            } else {
                const bundle = [];
                for (let i = 0; i < rooms.length; i++) {
                    bundle.push ({room: rooms[i], moderators: []})
                }

                return res.status(200).send({msg: bundle});
            }
        }

    } catch (error) {
        return res.status(500).send({msg: error.message});
    }
    
}

//  add a moderator to a room [POST] /api/rooms roomname moderatorname
exports.addModerator = async (req, res) => {

    try {

        // check that room exits
    
        // check that user identified is admin or moderator

        // update the list of modierators


    } catch (error) {
        return res.status(500).send({msg: error.message});
    }
    
}

//  delete a moderator to a room [DELETE] /api/rooms roomname moderatorname
exports.deleteModerator = async (req, res) => {

    try {

        // check that room exits
    
        // check that user is a moderator of the room

        // remove the moderator fromg the room


    } catch (error) {
        return res.status(500).send({msg: error.message});
    }
    
}

//  add a moderator to a room [DELETE] /api/rooms roomname moderatorname
exports.addModerator = async (req, res) => {

    try {

        // check that room exits
    
        // check that user identified is admin or moderator

        // update the list of modierators


    } catch (error) {
        return res.status(500).send({msg: error.message});
    }
    
}

async function isAdmin (userId) {
    try {
        const user = await User.findByPk(userId);
        const roles = await user.getRoles();

        for (let i = 0; i < roles.length; i++) {
            if (roles[i].name === "admin") {
                return true;
            }
        }
        return false;
    } catch (error) {
        return res.status(500).send({msg: error.message});
    }
};

async function isAdminOrModerator (userId) {
    try {
        const user = await User.findByPk(userId);
        const roles = await user.getRoles();

        for (let i = 0; i < roles.length; i++) {
            if (roles[i].name === "admin" || roles[i].name == "moderator") {
                return true;
            }
        }
        return false;
    } catch (error) {
        return res.status(500).send({msg: error.message});
    }
};
  
app.delete ("/api/rooms/cleanup", 
  authJwt.verifyToken, 
  authJwt.isAdmin,
  controller.cleanupRoom
);

app.post ("/api/rooms/user/block", 
  authJwt.verifyToken, 
  authJwt.isModeratorOrAdmin,
  controller.blockUser
);

app.post ("/api/rooms/user/unblock", 
  authJwt.verifyToken, 
  authJwt.isModeratorOrAdmin,
  controller.unBlockUser
);

app.delete ("/api/rooms/message", 
  authJwt.verifyToken, 
  authJwt.isModeratorOrAdmin,
  controller.deleteMessage
);

app.delete ("/api/rooms/user", 
  authJwt.verifyToken, 
  authJwt.isModeratorOrAdmin,
  controller.deleteUserMessages
);


// user functions
app.post ("/api/rooms/enter", 
  authJwt.verifyToken, 
  controller.enterRoom
);

  
app.post ("/api/rooms/leave", 
  authJwt.verifyToken, 
  controller.deleteMessage
);

  
app.get ("/api/rooms/messages", 
  authJwt.verifyToken, 
  controller.deleteMessage
);


// delete the user's activity list. This will delete all linked activities
exports.delete = async (req, res) => {

    try {

        // check if an activity list exists for the user signed on
        userId = req.session.userId;
        let list = await ActivityList.findOne({where: {owner: userId}});

        if (list) { // an activity list can be destroyed
            list = await ActivityList.destroy({where: {owner: userId}});
            return res.status(200).send({msg: "Your activity list and all activities have been removed"});
        } else {
            return res.status(400).send({msg: "You do not have an activity list!"});
        }

    } catch (error) {
        return res.status(500).send({msg: error.message});
    }
        
}
