const { authJwt, verifySignUp } = require("../middleware");
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
  app.get ("/api/users", 
    authJwt.verifyToken, 
    authJwt.isAdmin,
    controller.listUsers
  );

  // user creation handle by signup

  // the current user can modify email or password
  app.put(
    "/api/users",
    authJwt.verifyToken,
    controller.modifyUser
  )

  // the administrator or the current user only can delete user
  app.delete(
    "/api/users",
    authJwt.verifyToken,
    authJwt.isAdminOrCurrentUser,
    controller.deleteUser
  );

  // modify user roles - requires admin privleges and can't be done for root
  app.put(
    "/api/roles",
    authJwt.verifyToken,
    authJwt.isAdmin,
    verifySignUp.checkRolesExist,
    controller.modifyRoles
  )

  // list user roles - requires admin privleges if user name provided
  app.get(
    "/api/roles",
    authJwt.verifyToken,
    controller.listRoles
  )
};
