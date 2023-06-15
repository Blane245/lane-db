const fs = require("fs");
const path = require("path");
const db = require("../models")
const User = db.user;
var bcrypt = require("bcryptjs");

// list all users
exports.listUsers = async (req, res) => {
  try 
	{ 
		const users = await User.findAll({});
		const returnUsers = [];
		users.forEach (user => {
		  returnUsers.push({username: user.username, email: user.email});
		});
		res.status(200).send(returnUsers);
	} catch (error) {
		res.status(500).send("Error while retrieving users.");
	}
};

// create user is handled by signup

// the current user can modify their own email address and password
exports.modifyUser = (req, res) => {
	const newPassword = req.query.password;
	const newEmail = req.query.email;
	try 
	{
		User.findByPk(req.userId)
			.then((user) => {
				if (user) {
					user.update({
						password: (newPassword)? bcrypt.hashSync(newPassword, 8): user.password,
						email: (newEmail)? newEmail: user.email
					});
				}
			});
		return res.status(200).send("User password and/or email modified");
	} catch (err) {
		return res.status(500).send(err.message);
	}
};

// the administrator or the current user only can delete user
//TODO complete - need to delete user record and all users_roles links
exports.deleteUser = async (req, res) => {

	// this function uses mysql queries to delete reords

	try 
	{
		// handle the absence of a username in the query
		if (req.query.username) {

			// root user cannot be deleted
			if (req.query.username == "root") {
				return res.status(403).send("Root user cannot be deleted!");
			}

			const userName = req.query.username;

			// remove the user and the role link records
			User.findOne ({where: {username: userName}}).then(async (user) => {
				if (user) {
					await user.destroy();
					let msg = "User " + userName + " has been deleted";
					if (req.session.user != 1) { 
						req.session = null;
						msg+= " and signed out";
					}
					return res.status(200).send(msg + "!");
				} else {
					return res.status(403).send("User "+ userName+ " does not exist and cannot be deleted!");
				}
			});
		} else {
			return res.status(403). send("The user to be deleted name was not provided");
		}
	} catch (err) {
		res.status(500).send(err.message);
	}

};
