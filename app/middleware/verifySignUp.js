const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

checkUsernameAndEmail = (req, res, next) => {
  // Username
  User.findOne({
    where: {
      username: req.query.username
    }
  }).then(user => {
    if (user) {
      res.status(400).send({
        message: "Failed! Username is already in use!"
      });
      return;
    }

    // Email
    if (req.query.email) {
      User.findOne({
        where: {
          email: req.query.email
        }
      }).then(user => {
        if (user) {
          res.status(400).send({
            message: "Failed! Email is already in use!"
          });
          return;
        }
      });
    } else {
      res.status(400).send({
        message: "Email address is required!"
      });
      return;
    }
    if (!req.query.password) {
      res.statue(400).send({
        message: "Password is required!"
      });
      return;
    }
    next();
  });
};

checkRolesExisted = (req, res, next) => {
  if (req.query.roles) {
    for (let i = 0; i < req.query.roles.length; i++) {
      if (!ROLES.includes(req.query.roles[i])) {
        res.status(400).send({
          message: "Failed! Role does not exist = " + req.query.roles[i]
        });
        return;
      }
    }
  }
  
  next();
};

const verifySignUp = {
  checkUsernameAndEmail,
  checkRolesExisted: checkRolesExisted
};

module.exports = verifySignUp;
