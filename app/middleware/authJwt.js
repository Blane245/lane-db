const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models/index.js");
const User = db.user;
verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!"
      });
    }
    req.userId = decoded.id;
    next();
  });
};

isAdmin = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    const roles = getRoles (user);
    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "admin") {
        next();
        return;
      }
    }
    res.status(403).send({
      message: "Require Admin Role!"
    });
    return;
  });
};

isModerator = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    const roles = getRoles (user);
    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "moderator") {
        next();
        return;
      }
    }
    res.status(403).send({
      message: "Requires Modertor Role!"
    });
    return;
  });
};

isModeratorOrAdmin = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    const roles = getRoles (user);
    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "admin" || roles[i].name === "moderator") {
        next();
        return;
      }
    }
    res.status(403).send({
      message: "Require Admin or Moderator Role!"
    });
    return;
  });
};

async function getRoles (user) {
  const theRoles = [];
  try {
    Users_roles.findAll({
      where: {userId: user.id},
      include:[{
        model:db.role,
        attributes: ['name'],
      }]
    }).then(users_roles => {
      theRoles = users_roles.name;
    }); 
  } catch (err) {
      res.send(err);
    }
  return theRoles;
}

const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin,
  isModerator: isModerator,
  isModeratorOrAdmin: isModeratorOrAdmin
};
module.exports = authJwt;
