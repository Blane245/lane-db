const package = require("../../package.json");
const fs = require("fs");

// list all users
//TODO need to convert \n to paragraphs and \t to tabs
exports.getVersion = async (req, res, next) => {
  try 
	{	
		const releaseText = fs.readFileSync("release.txt", "utf8");
		res.status(200).send({msg: "lanedb version:" + package.version + "\n" + releaseText});
	} catch (error) {
		res.status(200).send({msg: "lanedb version:" + package.version});
	}
};
