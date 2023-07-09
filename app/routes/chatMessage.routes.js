const { authJwt, verifySignUp } = require("../middleware");
const controller = require("../controllers/chatMessage.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  
  app.post ("/api/rooms/messages/add", 
    authJwt.verifyToken, 
    controller.addMessage
  );

  app.delete ("/api/rooms/messages/cleanup", 
    authJwt.verifyToken, 
    authJwt.isModeratorOrAdmin,
    controller.cleanupMessages
  );
  
  app.delete ("/api/rooms/messages/delete", 
    authJwt.verifyToken, 
    authJwt.isModeratorOrAdmin,
    controller.deleteMessages
  );
      
  app.get ("/api/rooms/messages/list", 
    authJwt.verifyToken, 
    controller.listMessages
  );
}
