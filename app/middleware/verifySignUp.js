const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

checkUsernameAndEmail = async (req, res, next) => {

  // validate username and password and email
  const userName = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  try { 

    if (!userName) {
      return res.status(400).send("Failed! username is required!");
    }

    if (!password) {
      return res.status(400).send("Failed! password is required!");
    }

    if (!email) {
      return res.status(400).send("Failed! password is required!");
    }

    // Unique Username
    let user = await User.findOne({
      where: {
        username: req.body.username
      }
    });
    if (user) {
      return res.status(400).send("Failed! Username is already in use!");
    }

    // Unique Email
    const user2 = await User.findOne({
      where: {
        email: req.body.email
      }
    });
    if (user2) {
      return res.status(400).send("Failed! Email is already in use!");
    }
      
    // we're good
    return next();

  } catch (error) {
    return res.status(500).send(error.message);
  }
}

checkRolesExist = (req, res, next) => {
  if (req.query.roles) {
    for (let i = 0; i < req.query.roles.length; i++) {
      if (!ROLES.includes(req.query.roles[i])) {
        return res.status(400).send("Failed! Role does not exist: '" + req.query.roles[i]+"'");
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
