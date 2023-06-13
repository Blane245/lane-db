const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const path = require("path");
const bodyParser = require ('body-parser');
var bcrypt = require("bcryptjs");
require('dotenv').config();

var corsOptions = { origin: "*"};

const app= express();
app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());
// parse requesets of content type - application/x-www-for-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession ({
  name: "lanedb-session",
  keys: ["COOKIE_SECRET"],
  httpOnly: true,
}));

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);

// set up the listener
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`server is running on port ${port}.`);
});

// load the db models and sync

const db = require("./app/models");
db.sequelize.sync ({ force: true }).then(() => {
  console.log("connected to data base.");

  // create the default admin user and the roles
  initial(db);
});


// catch 404 and forward to error handler
//app.use(function(req, res, next) {
//  next(createError(404, 'Page not found: ' + req.url ));
//});
  
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  console.log(err);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(res.locals.message);
});


// the initial user and roles
async function initial (db) {
  const Role = db.role;
  const User = db.user;
  
  const role1 = await Role.create({
    name: "user"});
  console.log("created Role:", JSON.stringify(role1, null, 2) );
  
  const role2 = await Role.create({
    name: "moderator"});
  console.log("created Role:", JSON.stringify(role2, null, 2) );
  
  const role3 = await Role.create({
    name: "admin"});
  console.log("created Role:", JSON.stringify(role3, null, 2) );
  
  const user = await User.create({
    username: "root",
    email: "blane2245@gmail.com",
    password: bcrypt.hashSync("root", 8)
  })
  console.log("created User:", JSON.stringify(user, null, 2) );
  

  // make root have all roles
  const result = await user.setRoles([role1, role2, role3]);
  console.log("added roles to root", role1.id, role2.id, role3.id);
}

  