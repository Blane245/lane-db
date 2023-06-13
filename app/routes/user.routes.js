const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  // only administrators can access these functions
  app.get ("/users", 
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.listUsers
  );

  app.post(
    "/users",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.createUser
  );

  app.put(
    "/users",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.modifyUser
  );

  app.delete(
    "/users",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.deleteUser
  );
};
