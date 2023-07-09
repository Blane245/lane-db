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
  
  app.post ("/api/rooms/user/block", 
    authJwt.verifyToken, 
    authJwt.isModeratorOrAdmin,
    controller.blockUser
  );
  
  app.post ("/api/rooms/user/unblock", 
    authJwt.verifyToken, 
    authJwt.isModeratorOrAdmin,
    controller.unblockUser
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
    controller.leaveRoom
  );

  app.get ("/api/rooms/users", 
    authJwt.verifyToken, 
    controller.listRoomUsers
  );

}
