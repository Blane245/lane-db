const fs = require("fs");
const path = require("path");
const db = require("../models")
const User = db.user;
const Role = db.role;
var bcrypt = require("bcryptjs");
const Op = db.Sequelize.Op;
const WSClient = require("../middleware/WSClients")
var wsClients = null;
exports.setClients = (clients) => {wsClients = clients};

// list all users
exports.listUsers = async (req, res) => {
  try 
	{ 
		const users = await User.findAll({});
		const returnUsers = [];
		users.forEach (user => {
		  returnUsers.push({username: user.username, email: user.email});
		});
		res.status(200).send({users:returnUsers});
	} catch (error) {
		res.status(500).send({msg: error.message});
	}
};

// create user is handled by signup

// the current user can modify their own email address and password
exports.modifyUser = (req, res) => {
	const newPassword = req.query.password;
	const newEmail = req.query.email;
	try 
	{
		User.findByPk(req.session.userId)
			.then((user) => {
				if (user) {
					user.update({
						password: (newPassword)? bcrypt.hashSync(newPassword, 8): user.password,
						email: (newEmail)? newEmail: user.email
					});
				} else {
					return res.status(500).send({msg: "Error finding user record for user number " + req.session.userId.toString()});
				}
			});
		return res.status(200).send({msg: "User password and/or email modified"});
	} catch (error) {
		return res.status(500).send({msg: error.message});
	}
};

// the administrator or the current user only can delete user
exports.deleteUser = async (req, res) => {

	// this function uses mysql queries to delete reords

	try 
	{
		const userName = req.query.username;
		// handle the absence of a username in the query
		if (userName) {

			// root user cannot be deleted
			if (userName == "root") {
				return res.status(400).send({msg: "Root user cannot be deleted!"});
			}

			// remove the user and the role link records
			User.findOne ({where: {username: userName}}).then(async (user) => {
				if (user) {
					await user.destroy();
					let msg = "User " + userName + " has been deleted";
					if (req.session.userId != 1) { 
						req.session = null;
						msg+= " and signed out";
					}
					return res.status(200).send({msg: msg + "!"});
				} else {
					return res.status(400).send({msg: "User '"+ userName+ "' does not exist and cannot be deleted!"});
				}
			});
		} else {
			return res.status(400). send({msg: "The user to be deleted name was not provided"});
		}
	} catch (error) {
		res.status(500).send({msg: error.message});
	}

};

exports.modifyRoles = async (req, res, next) => {

	try 
	{
		// get the user name and the new roles
		const userName = req.query.username;
		const roleNames = req.query.roles;

		// check that the user is defined, not root, and exists
		if (userName) {
			if (userName != "root") {

				const user = await User.findOne({where: {username: userName}});
				if (!user) {
					return res.status(400).send({msg: "User "+ userName+ " does not exist!"});
				}

				// change the links between the user and roles
				if (req.query.roles) {
					const roles = await Role.findAll({
						where: {
						name: {
							[Op.or]: roleNames,
						},
						},
					});
					const result = await user.setRoles(roles)
					if (result) {
						const authorities = [];
						const roles = await user.getRoles();
						for (let i = 0; i < roles.length; i++) {
						  authorities.push("ROLE_" + roles[i].name.toUpperCase());
						}
						return res.status(200).send({name: user.username, roles: authorities});
					} else {
						return res.status(500).send({msg: "User "+ userName+ " roles NOT updated!"});
					}
				} else {
						return res.status(400).send({msg: "No new roles provided!"});
				}
			
			} else {
				return res.status(403).send({msg: "Roles for the root user cannot be changed!"});
			}

		} else {
			return res.status(400). send({msg: "The user name was not provided!"});
			
		}
	} catch (error) {
		res.status(500).send({msg: error.message});
	}
}

exports.listRoles = async (req, res, next) => {
	try {

		// get the user name
		const userName = req.query.username;

		// if the user name is provided, the current user must have admin privleges and the user must exist
		if (userName) {
			if (await isAdmin (req.session.userId, res)) {
				const user = await User.findOne({where: {username: userName}});
				if (!user) {
					return res.status(400).send({msg: "User '"+ userName+ "' does not exist!"});
				} else {
					const authorities = [];
					const roles = await user.getRoles();
					for (let i = 0; i < roles.length; i++) {
					  authorities.push("ROLE_" + roles[i].name.toUpperCase());
					}
				
					return res.status(200).send({name: user.username, roles: authorities});
				}
			} else {
				return res.status(403). send({msg: "This requires Admin privleges!"});
			}

		} else {

			// list the current users roles
			const user = await User.findByPk(req.session.userId);

			const authorities = [];
			const roles = await user.getRoles();
			for (let i = 0; i < roles.length; i++) {
				authorities.push("ROLE_" + roles[i].name.toUpperCase());
			}
		
			return res.status(200).send({username: user.username, roles: authorities});
	}

	} catch (error) {
		res.status(500).send({msg: error.message});
	}

}

//helper functions

// see if the user has the admin role
async function isAdmin (userId, res) {
	try {
	  const user = await User.findByPk(userId);
	  const roles = await user.getRoles();
  
	  for (let i = 0; i < roles.length; i++) {
		if (roles[i].name === "admin") {
		  return true;
		}
	  }
  
	  return false;
	} catch (error) {
	  res.status(500).send({msg: "Unable to validate User role!",
	  });
	}
  };
  
