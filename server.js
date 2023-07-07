const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const bodyParser = require ('body-parser');
var bcrypt = require("bcryptjs");
require('dotenv').config();


var corsOptions = { origin: "*"};

var isDev = ((process.env.NODE_ENV || "development") == "development")? true: false
const app= express();
//app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());
// parse requesets of content type - application/x-www-for-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession ({
  name: (isDev)?"lanedb-test-session":"lanedb-session",
  keys: ["COOKIE_SECRET"],
  httpOnly: true,
}));

// routes
require("./app/routes/version.routes")(app);
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/activitylist.routes")(app);
require("./app/routes/todo.routes")(app);

// set up the listener
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`server is running on port ${port}.`);
});

// load the db models and sync

const db = require("./app/models");
const force = (isDev)?true: false
db.sequelize.sync ({ force: force }).then(() => {
  // console.log("connected to data base.");

  // create the default admin user and the roles
  if (isDev)
    initial(db);
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
 return res.status(404).send({msg: "That function is not implemented"});
});
  
// error handler
app.use(function(err, req, res, next) {

  if (isDev) console.log(err);
  res.locals.message = error.message;
  res.locals.error = isDev ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({msg: res.locals.message});
});


// the initial user and roles
async function initial (db) {
  const Role = db.role;
  const User = db.user;
  
  const roles = []
  db.ROLES.forEach (async function (rolename) {
    const role = await Role.create({name: rolename});
    roles.push(role);
    // console.log("created Role:", JSON.stringify(role, null, 2));
  });
  
  const config = require("./app/config/auth.config");

  const user = await User.create({
    username: "root",
    email: "blane2245@gmail.com",
    password: bcrypt.hashSync(config.rootPassword, 8)
  })
  // console.log("created User:", JSON.stringify(user, null, 2) );
  
  // make root have all roles
  const result = await user.setRoles(roles);
  // console.log("added all roles to root");
}

  
