const db = require("../models");
const ActivityList = db.activitylist;
const Activity = db.activity;
var Op = db.Sequelize.Op;

//TODO implement activity maintenance


// user may list activities on their list in priority order. [GET /activities?status=[statuslist]]
exports.get = async (req, res, next) => {
    try {

        // get the status array parameter
        let statuses = db.ACTIVITYSTATUSES;
        const statusList = req.query.status;
        if (statusList) {
            statuses = []
            if (Array.isArray(statusList)) {

                for (const status of statusList){
                    if (isValidStatus(status)) {
                        statuses.push(status);
                    } else {
                        return res.status(403).send("'"+ status + "' is not a valid status for an activity!");
                    }
                };
            } else {
                statuses.push(statusList);
            }
        } 

        // get the activity list record for the user
        userId = req.session.user;
        const activityHeader = await ActivityList.findOne({where: {owner: userId}});

        if (!activityHeader) { // an activity list does not exist, no activities for this user
            return res.status(200).send("You must add an activity list first!");
        }

        // update the session to indicate that a list has been provided
        req.session.activitiesListed = true;

        // get the list of activities for the identified statuses
        const list = await activityHeader.getToDos(
            {where: {"status": {[Op.in]: statuses} }},
            {order: {"priority": "ASC"}});
        return res.status(200).send({list:list, message:"Your activity list for (" + statuses.toString() + ")"});

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
    
}

// user may delete all activities on an activity list [DELETE /actvities ]
// user may delete an activity with a specific description. [/activities?description=description DELETE]
exports.delete = async (req, res, next) => {

    try {
        const description = req.query.description;

        // get the activity list record for the user
        userId = req.session.user;
        const activityHeader = await ActivityList.findOne({where: {owner: userId}});
        if (!activityHeader) { // an activity list does not exist, no activities for this user
            return res.status(403).send("You must add an activity list first!");
        }

        // delete the activity record or all of the activity records
        if (description) {
            await Activity.destroy ({
                where:
                    {description: description,
                        activitylistId: activityHeader.id
                    }
            });
            return res.status(200).send("The activity with description'"+description+"' either did not exist or has been deleted.");
        } else { // delete all activity for the user
            await Activity.destroy ({
                where:
                    {activitylistId: activityHeader.id
                    }

            });
            return res.status(200).send("All activities has been deleted.");
        }
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

// user may add an activity [/activities POST parameters: description, /priority=1/, others as this evolves]
exports.post = async (req, res) => {
    try {
        const description = req.query.description;
        const priorty = req.query.priority? req.query.priority: 1;
        const priority = Number.parseInt(req.query.priority);
        if (req.query.priority && isNaN(priority)) 
            return res.status(403).send("Priority number be a number!");

        // get the activity list record for the user
        userId = req.session.user;
        const activityHeader = await ActivityList.findOne({where: {owner: userId}});

        if (!activityHeader) { // an activity list does not exist, no activities for this user
            return res.status(403).send("You must add an activity list first");
        }

        // create an activity record
        const activity = await Activity.create({description:description, priority:priorty, status: db.ACTIVITYSTATUSES[0]})

        // add it to the activity list
        await activityHeader.addToDos (activity.id);
        return res.status(200).send(
            "A new activity has been added with priority "+priorty.toString()+" status '"+activity.status + "'" );
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

// user may change the status or priority of an activity [/activities PUT parameters: description, /priority/, /status/ ]
//TODO a bit error prone on processing optional parameters
exports.put = async (req, res) => {
    try {

        const priority = Number.parseInt(req.query.priority);
        if (req.query.priority && isNaN(priority)) 
            return res.status(403).send("Priority number be a number!");
        const status = req.query.status;
        if (status && !isValidStatus(status))
            return res.status(403).send("'"+ status + "' is not a valid status for an activity!");
        const description = req.query.description;


        let newActivity = {};
        if (!isNaN(priority)) 
            newActivity.priority = priority;
        if (status)
            newActivity.status = status;
        if (newActivity == {})
            return res.status(403).send("You must provide a new status or priority for the activity!");


        // find the user's activity list and then update the description
        const activityHeader = await ActivityList.findOne({where: {owner: userId}});

        if (!activityHeader) { // an activity list does not exist, no activities for this user
            return res.status(403).send("You must add an activity list first!");
        } 
        const activity = await Activity.findOne({where:
            {
                description: description,
                activitylistId: activityHeader.id
                
            }});
        if (activity) {
            await activity.set(newActivity);
            return res.status(200).send({description: description, priority: priority, status: status});
        } else {
            return res.status(403).send("The activity with description '"+description+"' does not exist!");
        }
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}
// helper function to check that an activity status is valid
function isValidStatus (status) {

    for (const validStatus of db.ACTIVITYSTATUSES) {
        if (status == validStatus)
            return  true;
    };

    return false;

}
