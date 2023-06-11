const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require ('body-parser');
require('dotenv').config();

var corsOptions = { origin: "*"};

const app= express();
app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());
// parse requesets of content type - application/x-www-for-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

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
app.use(function(req, res, next) {
  next(createError(404, 'Page not found: ' + req.url ));
});
  
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// the initial user and roles
async function initial (db) {
  const Role = db.role;
  const User = db.user;
  const Users_Roles = db.users_roles;
  let role = null;
  let user = null;
  role = await Role.create({
    name: "user"});
  console.log("created Role:", JSON.stringify(role, null, 2) );
  
  role = await Role.create({
    name: "moderator"});
  console.log("created Role:", JSON.stringify(role, null, 2) );
  
  role = await Role.create({
    name: "admin"});
  console.log("created Role:", JSON.stringify(role, null, 2) );
  
  user = await User.create({
    username: "root",
    email: "blane2245@gmail.com",
    password: "root"
  })
  console.log("created User:", JSON.stringify(user, null, 2) );;
  

  // make root have all roles
  const roles = await Role.findAll ();
  console.log(roles);
  for (const role of roles) {
    const users_roles = await Users_Roles.create ({
      "userId": 1,
      "roleId": role.id,
    })
    console.log("create user_role:", JSON.stringify(users_roles, null, 2));
    
  }
}

  