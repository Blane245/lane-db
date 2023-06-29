const { authJwt, verifySignUp } = require("../middleware");
const controller = require("../controllers/todo.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  // list activities
  app.get(process.env.ENDPOINT+"todo", 
    authJwt.verifyToken, 
    controller.get
  );

  // delete activitites
  app.delete(
    "/api/todo",
    authJwt.verifyToken,
    controller.delete
  );

  // add activitites
  app.post(
    "/api/todo",
    authJwt.verifyToken,
    controller.post
  );

  // modify activitites
  app.put(
    "/api/todo",
    authJwt.verifyToken,
    controller.put
  );

}