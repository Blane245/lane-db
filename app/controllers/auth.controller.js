const db = require("../models");
const config = require("../config/auth.config");
const { authJwt } = require("../middleware");
const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
  // Save User to Database
  try {
    const user = await User.create({
      username: req.query.username,
      email: req.query.email,
      password: bcrypt.hashSync(req.query.password, 8),
    });

      // user role assigned to new users
      const result = user.setRoles([1]);
      if (result) res.status(200).send("User registered successfully!");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.signin = async (req, res) => {
  try {
    userName =req.query.username;
    if (userName) {
      // find the user record
      const user = await User.findOne({
        where: {
          username: req.query.username,
        },
      });

      if (!user) {
        return res.status(400).send("User '"+req.query.username+"' not found.");
      }

      // validate the password
      if (!bcrypt.compareSync(req.query.password, user.password))
        return res.status(400).send("Invalid Password!");

      // get the user toke and register it and the userId in the session
      const token = jwt.sign({ id: user.id },
                            config.secret,
                            {
                              algorithm: 'HS256',
                              allowInsecureKeySizes: true,
                              expiresIn: 86400, // 24 hours
                            });

      req.session.token = token;
      req.session.userId = user.id;

      return res.status(200).send("User '"+user.username+"' signed in.");
    } else {
        return res.status(403).send("username not provided.");
    }

  } catch (error) {
    return res.status(500).send(error.message);
  }
};

exports.signout = async (req, res) => {
  try {
    req.session = null;
    return res.status(200).send({
      message: "You've been signed out!"
    });
  } catch (err) {
    this.next(err);
  }
};