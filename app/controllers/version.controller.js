const package = require("../../package.json");
const fs = require("fs");
const WSClient = require("../middleware/WSClients")
var wsClients = null;
exports.setClients = (clients) => {wsClients = clients};

// list all users
exports.getVersion = async (req, res, next) => {
  try 
	{	
		const releaseText = fs.readFileSync("release.txt", "utf8");
		res.status(200).send({msg: "lanedb version:" + package.version + "\n" + releaseText});
	} catch (error) {
		res.status(200).send({msg: "lanedb version:" + package.version});
	}
};
