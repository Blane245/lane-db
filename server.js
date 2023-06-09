const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require ('body-parser');
require('dotenv').config();

var corsOptions = { origin:"http://localhost:8082"}

const app= express();
app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());
// parse requesets of content type - application/x-www-for-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

// log every request to teh console
const router = express.Router();
router.use(function(req,res,next) {
  console.log(req.method, req.url, req.auth);
});
// router tables
const indexRouter = require("./app/routes/index");
// const userRouter = require("./app/routes/user");
app.use("/", indexRouter);
// app.use("/user", userRouter);

// set up the listener
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`server is running on port ${port}.`);
});

// load the db models and sync

const db = require("./app/models/_index");
//TODO when in production, drop the sync arguments
db.sequelize.sync (/*{ force: true }*/).then(() => {
  console.log("connected to data base.");
});


// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404, 'Page not found: ' + req.url ));
// });
  
// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

