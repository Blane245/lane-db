const { isModerator } = require("../middleware/authJwt");
const db = require("../models");
const Room = db.room;
const User = db.user;
const Op = db.Sequelize.Op;

// this handles the administration of chat rooms
// Users may enter and leave rooms, and list all of the users, blocked users, and administrators of the room

exports.createRoom = async (req, res) => {

    try {

        const roomname = req.body.roomname;
        const moderatorname = req.body.moderatorname;
        if (! roomname) {
            return res.status(400).send({msg: "A room name was not given"});
        }

        // if the moderator was given, check if the user record exists
        let moderator = null;
        if (moderatorname) {
            moderator = await User.findOne({
                where: {
                    username: moderatorname
                }
            });
            if (! moderator) 
                return res.status(400).send({
                    msg: "A moderator named '" + moderatorname + "' does not exists"
                });
             else {
                if (!isModeratorOrAdmin(moderator.id)) 
                    return res.status(400).send({
                        msg: "The named user '" + moderatorname + "' is not an admininstrator or moderator"
                    });
                
            }

        }

        // check if room already exists
        let room = await Room.findOne({
            where: {
                roomname: roomname
            }
        });
        if (room) {
            return res.status(400).send({
                msg: "A room named '" + roomname + "' already exists"
            });
        } else {
            room = await Room.create({roomname: roomname});
            if (moderator) 
                await Room.addModertors_rooms(moderator.id);
            
            return res.status(200).send({
                msg: "Room '" + room.roomname + "' has been created"
            });
        }
    } catch (error) {
        return res.status(500).send({msg: error.message});
    }

}

// delete a room (admin only) [DELETE] /api/rooms roomname
exports.deleteRoom = async (req, res) => {

    try {

        const roomname = req.body.roomname;
        if (! roomname) {
            return res.status(400).send({msg: "A room name was not given"});
        }
        // check if room exists
        let room = await Room.findOne({
            where: {
                roomname: roomname
            }
        });
        if (room) {
            Room.destory({
                where: {
                    roomname: roomname
                }
            });
            return res.status(200).send({
                msg: "A room named '" + roomname + "' has been destroyed"
            });
        } else {
            return res.status(400).send({
                msg: "Room '" + room.roomname + "' does not exist"
            });
        }
    } catch (error) {
        return res.status(500).send({msg: error.message});
    }

}

// list all rooms (and their moderators) (admin only) [GET] /api/rooms
// list a moderator's rooms (moderator only) [GET] /api/rooms
exports.listRooms = async (req, res) => {

    try {

        const Admin = await isAdmin(req.userId);
        if (Admin) {
            const rooms = await Room.findAll({});
            if (! rooms) {
                return res.status(400).send({msg: "There are no rooms"});
            } else {
                const bundle = []
                for (let i = 0; i < rooms.length; i++) {
                    const moderators = Room.getRooms_moderators();
                    if (! moderators) 
                        moderators = [];
                    
                    bundle.push({room: rooms[i], moderators: moderators})
                }
            }
        } else {
            const rooms = await Room.get.Moderators_rooms({
                where: {
                    id: req.userId
                }
            });
            if (! rooms) {
                return res.status(400).send({msg: "You do not moderate any rooms"});
            } else {
                const bundle = [];
                for (let i = 0; i < rooms.length; i++) {
                    bundle.push({room: rooms[i], moderators: []})
                }

                return res.status(200).send({msg: bundle});
            }
        }

    } catch (error) {
        return res.status(500).send({msg: error.message});
    }

}

// add a moderator to a room [POST] /api/rooms roomname moderatorname
exports.addModerator = async (req, res) => {

    try {

        const roomName = req.body.roomname;
        const moderatorName = req.body.moderatorname;
        // check that room exits
        if (!roomName)
            return res.status(400).send({msg: "A room name must be provided"});
        const room = await Room.findOne({where: {roomname: roomName}});
        if (!room) 
            return res.status(400).send({msg: "A room named '" + roomName + "' does not exist"});

        // check that the moderator exists
        const moderator = await User.findOne({where: {username: moderatorName}});
        if (!moderator) 
            return res.status(400).send({msg: "There is no user named '" + moderatorName + "'"});
        // check that user is a moderator
        if (!isRoomModerator(moderator.id)) {
            return res.status(400).send({msg: "The user named '" + moderatorName + "' is not a room moderator"});
        }

        // check if the user is already a moderator
        const moderators = await room.getModertors_rooms({where: {id: room.id}});
        for (let i = 0; i < moderators.length; i++) {
            if (moderators[i].id = moderator.id)
                return res.status(400).send({msg: "User '" + moderatorName + "' is already a moderator for room '" + roomName +"'"});
        }

        // add the moderator to the room
        moderators.push(moderator)
        room.setModerators_rooms(moderators);

    } catch (error) {
        return res.status(500).send({msg: error.message});
    }

}

// delete a moderator to a room [DELETE] /api/rooms roomname moderatorname
exports.deleteModerator = async (req, res) => {

    try {
        const roomName = req.body.roomname;
        const moderatorName = req.body.moderatorname;
        // check that room exits
        if (!roomName)
            return res.status(400).send({msg: "A room name must be provided"});
        const room = await Room.findOne({where: {roomname: roomName}});
        if (!room) 
            return res.status(400).send({msg: "A room named '" + roomName + "' does not exist"});

        // check that the moderator exists
        const moderator = await User.findOne({where: {username: moderatorName}});
        if (!moderator) 
            return res.status(400).send({msg: "There is no user named '" + moderatorName + "'"});
        
        // remove the name user if it is the moderator list
        const moderators = await room.get_Moderators_rooms({where: {"roomname": room}});
        let isModerator = false;
        for (let i = 0; i < moderators.length; i++) {
            if (moderators[i].id == moderator.id) {
                isModerator = true;
                moderators.splice(i, 1);
                await room.setModerators_rooms(moderators);
                break;
            }
        }
        if (!isModerator) 
            return res.status(400).send({msg: "There is no moderator named '" + moderatorName + "' in room '" + roomName+"'"});
        else
            return res.status(200).send({msg: "Moderator '" + moderatorName + "' removed from '" + roomName+"'"});
    } catch (error) {
        return res.status(500).send({msg: error.message});
    }

}

// add a moderator to a room [POST] /api/rooms roomname moderatorname
exports.addModerator = async (req, res) => {

    try {

        const roomName = req.body.roomname;
        const moderatorName = req.body.moderatorname;
        // check that room exits
        if (!roomName)
            return res.status(400).send({msg: "A room name must be provided"});
        const room = await Room.findOne({where: {roomname: roomName}});
        if (!room) 
            return res.status(400).send({msg: "A room named '" + roomName + "' does not exist"});

        // check that the moderator exists
        const moderator = await User.findOne({where: {username: moderatorName}});
        if (!moderator) 
            return res.status(400).send({msg: "There is no user named '" + moderatorName + "'"});

        // check that user identified is admin or moderator
        if (!isModerator (moderator.id))
            return res.status(400).send({msg: "The user '" + moderatorName + "' is not a moderator or admin"});

        // check if the user is already a moderator for the room
        if (isRoomModerator (moderator.id, roomName)) 
            return res.status(400).send({msg: "The user '" + moderatorName + "' is already a moderator for room '"+roomName+"'"});
        
        // add the new moderator to the room
        const moderators = await room.getModerators_rooms({where: {"roomname": room}});
        moderators.push(moderator);
        await room.setModerators_rooms(moderators);
        return res.status(200).send({msg: "The user '" + moderatorName + "' has been added as a moderator for room '"+roomName+"'"});

    } catch (error) {
        return res.status(500).send({msg: error.message});
    }

}

// block a user from a room (admin and moderator) [POST] /api/rooms/user/block roomname username
exports.blockUser = async (req, res) => {

    try {

        const roomName = req.body.roomname;
        const userName = req.body.username;
        // check that room exits
        if (!roomName)
            return res.status(400).send({msg: "A room name must be provided"});
        const room = await Room.findOne({where: {roomname: roomName}});
        if (!room) 
            return res.status(400).send({msg: "A room named '" + roomName + "' does not exist"});

        // check that the user exists
        const user = await User.findOne({where: {username: userName}});
        if (!user) 
            return res.status(400).send({msg: "There is no user named '" + userName + "'"});

        // check if the user is already blocked
        const blockedUsers = await room.getBlocked_rooms({where: {roomname: roomName}});
        let isBlocked = false;
        for (let i = 0; i < blockedUsers.length; i++) {
            if (blockedUsers[i].id == user.id) {
                isblocked = true;
            }
        }
        if (isBlocked) 
            return res.status(400).send({msg: "User '" + userName + "' and already blocked from '" + roomName + "'"});

        // add the user to the block list
        blockedUsers.push(user);
        await room.setBlocked_rooms(blockedUsers);
        return res.status(200).send({msg: "The user '" + userName + "' has been blocked from room '"+roomName+"'"});

    } catch (error) {
        return res.status(500).send({msg: error.message});
    }

}

// unblock a user from a room (admin and moderator) [POST] /api/rooms/user/unblock roomname username
exports.unblockUser = async (req, res) => {

    try {

        const roomName = req.body.roomname;
        const userName = req.body.username;
        // check that room exits
        if (!roomName)
            return res.status(400).send({msg: "A room name must be provided"});
        const room = await Room.findOne({where: {roomname: roomName}});
        if (!room) 
            return res.status(400).send({msg: "A room named '" + roomName + "' does not exist"});

        // check that the user exists
        const user = await User.findOne({where: {username: userName}});
        if (!user) 
            return res.status(400).send({msg: "There is no user named '" + userName + "'"});
        
        // remove the name from teh blocked list if there is one with that name
        const blockedUsers = await room.getBlocked_rooms({where: {"roomname": roomName}});
        let isBlocked = false;
        for (let i = 0; i < blockedUsers.length; i++) {
            if (blockedUsers[i].id == user.id) {
                isBlocked = true;
                blockedUsers.splice(i, 1);
                await room.setBlocked_rooms(blockedUsers);
                break;
            }
        }
        if (!isBlocked) 
            return res.status(400).send({msg: "There is no user named '" + userName + "' in room '" + roomName+"' that is blocked"});
        else
            return res.status(200).send({msg: "User '" + userName + "' unblocked from '" + roomName+"'"});
    } catch (error) {
        return res.status(500).send({msg: error.message});
    }

}

// request to enter a room [POST] /api/rooms/enter roomname (note no approval required)
exports.enterRoom = async (req, res) => {

    try {

        const roomName = req.body.roomname;
        // check that room exits
        if (!roomName)
            return res.status(400).send({msg: "A room name must be provided"});
        const room = await Room.findOne({where: {roomname: roomName}});
        if (!room) 
            return res.status(400).send({msg: "A room named '" + roomName + "' does not exist"});

        // check if the user is already in the room
        const user = await User.findByPk(req.session.userId);
        if (!user) 
            return res.status(500).send({msg: "ALERT: User with id " + req.session.id.toString() + " not found."});
        const roomUsers = await room.getRooms_users({where: {if: room.id}});
        const inRoom = false;
        for (let i = 0; i < roomUsers.length; i++) {
            if (roomUsers[i].id == user.id) {
                inRoom = true;
                break;
            }
        }

        if (inRoom)
            return res.status(400).send({msg: "You are already in room '" + roomName + "'"});
        else {
            roomUsers.push(user);
            await room.setRooms_users(roomUsers);
            return res.status(200).send({msg: "You have entered room '" + roomName + "'"});
        }

    } catch (error) {
        return res.status(500).send({msg: error.message});
    }

}

// request to leave a room [POST] /api/rooms/leave roomname (user leaves all rooms they are in when disconnected)
exports.leaveRoom = async (req, res) => {

    try {

        const roomName = req.body.roomname;
        // check that room exits
        if (!roomName)
            return res.status(400).send({msg: "A room name must be provided"});
        const room = await Room.findOne({where: {roomname: roomName}});
        if (!room) 
            return res.status(400).send({msg: "A room named '" + roomName + "' does not exist"});

        // check that the user exists
        const user = await User.findOne({where: {id: req.session.userId}});
        if (!user) 
            return res.status(500).send({msg: "ALERT: The user with id " + req.session.userId.toStrng() + "not found"});
        
        // remove the name from the list of people in the room
        const roomUsers = await room.getRooms_users({where: {"roomname": roomName}});
        let isInRoom = false;
        for (let i = 0; i < blockedUsers.length; i++) {
            if (blockedUsers[i].id == user.id) {
                isInRoom = true;
                roomUsers.splice(i, 1);
                await room.setRooms_users(roomUsers);
                break;
            }
        }
        if (!isInRoom) 
            return res.status(400).send({msg: "You are not in room '" + roomName+"'"});
        else
            return res.status(200).send({msg: "You have been removed from '" + roomName+"'"});
    } catch (error) {
        return res.status(500).send({msg: error.message});
    }

}


// list all users, blocked users, and moderators in a room [GET] /api/rooms/users roomname
exports.listRoomUsers = async (req, res) => {

    try {

        const roomName = req.body.roomname;
        // check that room exits
        if (!roomName)
            return res.status(400).send({msg: "A room name must be provided"});
        const room = await Room.findOne({where: {roomname: roomName}});
        if (!room) 
            return res.status(400).send({msg: "A room named '" + roomName + "' does not exist"});


        // list all users and moderators messages in the room (would be nice to indicate if they are on line)
        const roomUsers = await room.getRooms_users({where: {"roomname": roomName}});
        const blockedUsers = await room.getBlocked_rooms({where: {"roomname": roomName}});
        const moderators = await room.getModerators_rooms({where: {"roomname": roomName}});
        return res.status(200).send(({users: roomUsers, blocked: blockedUsers, moderators: moderators}));

    } catch (error) {
        return res.status(500).send({msg: error.message});
    }

}


// helper functions
async function isAdmin(userId) {
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
async function isModerator (userId) {
    try {
        const user = await User.findByPk(userId);
        const roles = await user.getRoles();

        for (let i = 0; i < roles.length; i++) {
            if (roles[i].name === "moderator") {
                return true;
            }
        }
        return false;
    } catch (error) {
        return res.status(500).send({msg: error.message});
    }    
}
async function isRoomModerator(userId, room) {
    try {
        if (isAdmin(userId)) 
            return true;
        

        const user = await User.get_Moderators_rooms({
            where: {"roomname": room, "id": userId}
        });
        if (user) 
            return true;
         else 
            return false;
        
    } catch (error) {
        return res.status(500).send({msg: error.message});
    }
};
