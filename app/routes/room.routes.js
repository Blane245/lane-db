const { authJwt, verifySignUp } = require("../middleware");
const controller = require("../controllers/room.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  // this handles the administration of chat rooms
  // only administrators and moderators to do these functions. 
  // they include
  //  create a new room (with an optional moderator) [POST] /api/rooms roomname, (moderator)
  //  delete a room (admin only) [DELETE] /api/rooms roomname
  //  list all rooms (and their moderators) (admin only) [GET] /api/rooms
  //  list a moderator's rooms (moderator only) [GET] /api/rooms
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
  app.post ("/api/rooms", 
    authJwt.verifyToken, 
    authJwt.isAdmin,
    controller.createRoom
  );
  
  app.delete ("/api/rooms", 
    authJwt.verifyToken, 
    authJwt.isAdmin,
    controller.deleteRoom
  );
    
  app.post ("/api/rooms/moderator", 
    authJwt.verifyToken, 
    authJwt.isAdmin,
    controller.addModerator
  );
    
  app.delete ("/api/rooms/moderator", 
    authJwt.verifyToken, 
    authJwt.isAdmin,
    controller.deleteModerator
  );
    
  app.get ("/api/rooms", 
    authJwt.verifyToken, 
    authJwt.isModeratorOrAdmin,
    controller.listRooms
  );
  
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

}
