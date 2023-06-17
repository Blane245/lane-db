const { authJwt, verifySignUp } = require("../middleware");
const controller = require("../controllers/activity.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  // list activities
  app.get("/activity", 
    authJwt.verifyToken, 
    controller.get
  );

  // delete activitites
  app.delete(
    "/activity",
    authJwt.verifyToken,
    controller.delete
  );

  // add activitites
  app.post(
    "/activity",
    authJwt.verifyToken,
    controller.post
  );

  // modify activitites
  app.put(
    "/activity",
    authJwt.verifyToken,
    controller.put
  );

}