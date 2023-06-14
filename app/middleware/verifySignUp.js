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
      return res.status(400).send({
        message: "Failed! Username is already in use!"
      });
    }

    // Email
    if (req.query.email) {
      User.findOne({
        where: {
          email: req.query.email
        }
      }).then(user => {
        if (user) {
          return res.status(400).send({
            message: "Failed! Email is already in use!"
          });
        }
      });
    } else {
      return res.status(400).send({
        message: "Email address is required!"
      });
    }
    if (!req.query.password) {
      return res.statue(400).send({
        message: "Password is required!"
      });
    }
    return next();
  });
};

checkRolesExist = (req, res, next) => {
  if (req.query.roles) {
    for (let i = 0; i < req.query.roles.length; i++) {
      if (!ROLES.includes(req.query.roles[i])) {
        return res.status(400).send({
          message: "Failed! Role does not exist = " + req.query.roles[i]
        });
      }
    }
  }
  
  return next();
};

const verifySignUp = {
  checkUsernameAndEmail,
  checkRolesExist
};

module.exports = verifySignUp;
