const clientID = "clientID";
const clientSecret = "clientSecret";
exports.index = function(req, res, next) {
    const ID = req.query.clientID;
    const secret = req.query.clientSecret;
    if (ID == "clientID" && secret == "clientSecret") {
        res.json({token: "good"});
    } else {
        res.json({token: "bad"});
    }
}