const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const bodyParser = require('body-parser');
var bcrypt = require("bcryptjs");
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const url = require('url');
const { WSClients } = require("./app/middleware/WSClients");
const path = require('path');
require('dotenv').config();

var corsOptions = { origin: true, credentials: true };

var isDev = ((process.env.NODE_ENV || "development") == "development")? true: false
const app= express();

app.use(cors(corsOptions));

// sets express configuration to be more friendly with nginx reverse proxy
// https://expressjs.com/en/quide/behind-proxies.html
app.set('trust proxy', true); // trust first proxy

// parse requests of content-type - application/json
app.use(bodyParser.json());
// parse requesets of content type - application/x-www-for-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession ({
  name: process.env.SESSION,
  keys: ["COOKIE_SECRET"],
  httpOnly: true,
  sameSite: "none",
  secure:true
}));

// routes
require("./app/routes/version.routes")(app);
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/todo.routes")(app);
// require("./app/routes/appointment.routes")(app);

// pug view engin setup
app.set('views', [
  path.join(__dirname, 'app/views'), 
]);

app.set('view engine', 'pug');
app.set('vew options', {pretty: true});

// setup express search folders
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

// set up the listener
const port = process.env.PORT;
const expressServer = app.listen(port, () => {
  console.log(`server is running on port ${port}.`);
});

// setup the websocket
const wss = new WebSocket.Server({ server: expressServer, path: "/ws"});

// the object to hold the WebSocket clients
var wsClients = new WSClients(wss);
const socketServerController = require("./app/controllers/socketServer.controller");
// pass it to the controllers for them to use
socketServerController.set(wsClients);

// point all of the controllers to this object

// Handle the WebSocket connection event. This checks the request URL for 
// a JWT token. If the JWT can be verified, the client connection is added
// and the token is added to the wsClients array;
// otherwise, the connection is closed
wss.on("connection", (ws, req) => {
  const token = url.parse(req.url, true).query.token;
  console.log(token);
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      ws.close();
    } else {
      wsClients.add (ws, token, decoded.username);
      ws.emit("ack");
    }
  });

  ws.on('close', () => {
    
    // remove the user from the socket clients
    wsClients.delete (ws);
  });
});

// load the db models and sync
const db = require("./app/models");
const force = (isDev) ? true : false
db.sequelize.sync({ force: force }).then(() => {
  // console.log("connected to data base.");

  // create the default admin user and the roles when in dev
  if (isDev)
    initial(db);
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  return res.status(404).send({ msg: "That function is not implemented" });
});

// error handler
app.use(function (err, req, res, next) {

  if (isDev) console.log(err);
  res.locals.message = error.message;
  res.locals.error = isDev ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({ msg: res.locals.message });
});


// the initial user and roles
async function initial(db) {
  const Role = db.role;
  const User = db.user;

  const roles = []
  db.ROLES.forEach(async function (rolename) {
    const role = await Role.create({ name: rolename });
    roles.push(role);
    // console.log("created Role:", JSON.stringify(role, null, 2));
  });

  const user = await User.create({
    username: "root",
    email: "blane2245@gmail.com",
    password: bcrypt.hashSync(process.env.ROOT_PASSWORD, 8)
  })
  // console.log("created User:", JSON.stringify(user, null, 2) );

  // make root have all roles
  const result = await user.setRoles(roles);
  // console.log("added all roles to root");
}

