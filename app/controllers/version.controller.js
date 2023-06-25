const package = require("../../package.json");

// list all users
exports.getVersion = async (req, res, next) => {
  try 
	{
		res.status(200).send(package.version)
	} catch (error) {
		res.status(500).send(error.message);
	}
};

