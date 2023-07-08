const { authJwt, verifySignUp } = require("../middleware");
const controller = require("../controllers/appointment.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  // list appointments
  app.get("/api/appointment", 
    authJwt.verifyToken, 
    controller.get
  );

  // add an appointment
  app.post("/api/appointment", 
    authJwt.verifyToken, 
    controller.create
  );

  // delete appointment
  app.delete(
    "/api/appointment",
    authJwt.verifyToken,
    controller.delete
  );

  // modify appointment
  app.put(
    "/api/appointment",
    authJwt.verifyToken,
    controller.put
  );
}