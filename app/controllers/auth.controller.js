const db = require("../models");
const config = require("../config/auth.config");
const { authJwt } = require("../middleware");
const { body, validationResult } = require('express-validator');
const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = async (req, res, next) => {

  // Save User to Database if all is
  try {
    const userName =req.body.username;
    const password = req.body.password;
    const user = await User.create({
      username: userName,
      email: req.body.email,
      password: bcrypt.hashSync(password, 8),
    });

    // user role assigned to new users
    const result = user.setRoles([1]);
    if (result) res.status(200).send({msg: "User registered successfully!"});
  } catch (error) {
    res.status(500).send({msg: error.message});
  }
}


exports.signin = [
  
  // validate username and password
  body('username', "'username' is required.").trim().isLength({min: 1}).escape(),
  body('password', "'password' is required.").trim().isLength({min: 1}).escape(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req).array();
      const userName =req.body.username;
      const password = req.body.password;
      if (errors.length == 0) {

        // find the user record
        const user = await User.findOne({
          where: {
            username: userName,
          },
        });

        if (!user) {
          return res.status(400).send({msg: "User '"+userName+"' not found."});
        }

        // validate the password
        if (!bcrypt.compareSync(password, user.password))
          return res.status(400).send({msg: "Invalid Password!"});

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

        return res.status(200).send({msg: "User '"+user.username+"' signed in."});
      } else {
          return res.status(400).send({msg: "'username' and 'password' must be provided!"});
      }

    } catch (error) {
      return res.status(500).send({msg: error.message});
    }
  }
]

exports.signout = async (req, res) => {
  try {
    req.session = null;
    return res.status(200).send({msg: "You've been signed out!"});
  } catch (error) {
    this.next(err);
  }
};