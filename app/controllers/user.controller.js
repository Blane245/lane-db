const fs = require("fs");
const path = require("path");
exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.listUsers = (req, res) => {
  res.status(501).send("not implemented");
};

exports.createUser = (req, res) => {
  res.status(501).send("not implemented");
};

exports.modifyUser = (req, res) => {
  res.status(501).send("not implemented");
};

exports.deleteUser = (req, res) => {
  res.status(501).send("not implemented");
};
