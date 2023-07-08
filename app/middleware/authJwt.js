const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.user;

verifyToken = (req, res, next) => {
  let token = req.session.token;

  if (!token) {
    return res.status(403).send({msg: "You are not signed on!"});
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).send({msg: "Your session has expired. Sign in again!"});
    }
    req.userId = decoded.id;
    return next();
  });
};

isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    const roles = await user.getRoles();

    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "admin") {
        return next();
      }
    }

    return res.status(403).send({msg: "This requires Admin Role!"});
  } catch (error) {
    res.status(500).send({msg: error.message});
  }
};

isModerator = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    const roles = await user.getRoles();

    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "moderator") {
        return next();
      }
    }

    return res.status(403).send({msg: "Requires Moderator Role!"});
  } catch (error) {
    res.status(500).send({msg: error.message});
  }
};

isModeratorOrAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    const roles = await user.getRoles();

    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "moderator" || roles[i].name === "admin") {
        return next();
      }
    }

    return res.status(403).send({msg: "Requires Moderator or Admin Role!"});
  } catch (error) {
    res.status(500).send({msg: error.message});
  }
};

//Either the current user is admin or the current user matches the user being requested
isAdminOrCurrentUser = async (req,res, next) => {
  try {
    const user = await User.findByPk(req.userId);

    // first the admin
    const roles = await user.getRoles();

    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "admin") {
        return next();
      }
    }

    // check match between the current user and the one being requested
    // not providing username in query handled by the delete controller.
    if (req.query.username) {
      const reqUser = await User.findOne({
        where: {
          username: req.query.username,
        },
      });

      if (reqUser.id != req.session.userId) {
        return res.status(403).send({msg: "You can only delete yourself unless you are an admin!"});
      }
    } 
    return next();

  } catch (error) {
    res.status(500).send({msg: error.message});
  }
};


//TODO: implement when needed
isCurrentUser = async (req,res, next) => {
  return next();
}

const authJwt = {
  verifyToken,
  isAdmin,
  isModerator,
  isModeratorOrAdmin,
  isCurrentUser,
  isAdminOrCurrentUser,
};
module.exports = authJwt;
