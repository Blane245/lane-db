const { authJwt, verifySignUp } = require("../middleware");
const controller = require("../controllers/activityList.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  // add an activity list
  app.post("/api/activitylist", 
    authJwt.verifyToken, 
    controller.create
  );

  app.delete(
    "/api/activitylist",
    authJwt.verifyToken,
    controller.delete
  );

}