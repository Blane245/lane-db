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
			// first remove all of the user records
			const user = await User.findOne({where: {username: userName}});
			const roles = await user.getRoles();

		
			User.findOne ({where: {username:userName}}).then(user => {
				user.getRoles
			})
			// remove the user record
			User.destroy({where: {username:req.query.username}}).then((rowDeleted) => {
				if (rowDeleted != 1) 
					return res.status(500).send("Error while delete users. Number of rows delete is " + rowDeleted);
				else {

					// remove all of the users_roles records
					const roles = user
					Users_Roles.destroy({where: {username:req.query.username}}).then((rowDeleted) => {
						req.session = null;
						return res.status(200).send("User " + req.query.username + " deleted and signed out!");
					});
				}
			});
		} else {
			return res.status(403).send("User name to delete needs to be provided.");
		}
	} catch (err) {
		res.status(500).send(err.message);
	}

};
