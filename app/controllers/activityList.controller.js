const db = require("../models");
const ActivityList = db.activitylist;

//TODO implement activity list maintenance
// only one activity list can exist for a user
// only the user can add their activity lists [/activitylist POST with optional username]
// only the user can delete their activity lists [/activitylist DELETE with optional username]
//  deleting an activity list will remove all activities for the user

// other activity item maintenace is done by the activity controller
// user may delete all activities on an activity list [/actvities DELETE with optional username ]
// user may list all activities on their list [/activities GET with optional username]

// create and save new activity list
exports.create = async (req, res) => {

    try {

        // check if an activity list already exist for the user signed on
        userId = req.session.user;
        let list = await ActivityList.findOne({where: {owner: userId}});

        if (!list) { // an activity list can be created
           list = await ActivityList.create({owner: userId});
            return res.status(200).send("Your activity list has been created");
        } else {
            return res.status(403).send("You already have an activity list!");
        }

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
    
}

// delete the user's activity list. This wil delete all linked activities
exports.delete = async (req, res) => {

    try {

        // check if an activity list exists for the user signed on
        userId = req.session.user;
        let list = await ActivityList.findOne({where: {owner: userId}});

        if (list) { // an activity list can be destroyed
            list = await ActivityList.destroy({where: {owner: userId}});
            return res.status(200).send("Your activity list has been removed");
        } else {
            return res.status(403).send("You do not have an activity list!");
        }

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
        
}
