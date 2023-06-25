const controller = require("../controllers/version.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  // anyone can get the version number
  app.get ("/version", 
    controller.getVersion
  );

};
