const fs = require("fs");
const path = require("path");
const db = require("../models");
const User = db.user;
exports.listUsers = async (req, res) => {
	try 
	{ 
		const users = await User.findAll({});
		const returnUsers = [];
		users.forEach (user => {
		returnUsers.push {name, email} = user;});
		res.status(200).send(returnUsers);
	} catch (error) {
			res.status(500).send("Error while retrieving users.");
	}
}