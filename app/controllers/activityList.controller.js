const db = require("../models");
const ActivityList = db.activitylist;
const Activity = db.activity

//TODO implement activity list maintenance
// only one activity list can exist for a user
// only the user can add their activity lists [/activitylist POST with optional username]
// only the user can delete their activity lists [/activitylist DELETE with optional username]
//  deleting an activity list will remove all activities for the user

// create and save new activity list
exports.create = async (req, res) => {

    try {

        // check if an activity list already exist for the user signed on
        userId = req.session.user;
        let list = await ActivityList.findOne({where: {owner: userId}});

        if (!list) { // an activity list can be created
           list = await ActivityList.create({owner: userId});

           // add an activity record
           const anActivity = db.activity
            return res.status(200).send("Your activity list has been created");
        } else {
            return res.status(400).send("You already have an activity list!");
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
            return res.status(200).send("Your activity list and all activities have been removed");
        } else {
            return res.status(400).send("You do not have an activity list!");
        }

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
        
}
