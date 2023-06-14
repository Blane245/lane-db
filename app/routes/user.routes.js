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

  // only administrators can access this function
  app.get ("/users", 
    authJwt.verifyToken, 
    authJwt.isAdmin,
    controller.listUsers
  );

  // user creation handle by signup

  // the current user can modify email or password
  app.put(
    "/users",
    authJwt.verifyToken,
    authJwt.isCurrentUser,
    controller.modifyUser
  )

  // the administrator or the current user only can delete user
  app.delete(
    "/users",
    authJwt.verifyToken,
    authJwt.isAdminOrCurrentUser,
    controller.deleteUser
  );
};
