const db = require("../models");
const ActivityList = db.activitylist;
const ToDo = db.todo;
var Op = db.Sequelize.Op;

//TODO implement activity maintenance


// user may list activities on their list in priority order. [GET /activities?statuses=[statuslist]]
exports.get = async (req, res, next) => {
    try {

        // get the status array parameter
        let statuses = [];
        const statusList = req.query.status;
        if (statusList) {
            statuses = []
            if (Array.isArray(statusList)) {

                for (const status of statusList){
                    if (isValidStatus(status)) {
                        statuses.push(status);
                    } else {
                        return res.status(400).send("'"+ status + "' is not a valid status for an to do!");
                    }
                };
            } else {
                statuses.push(statusList);
            }
        } else
            statuses = db.TODOSTATUSES;
 

        // get the activity list record for the user
        userId = req.session.user;
        const activityHeader = await ActivityList.findOne({where: {owner: userId}});

        if (!activityHeader) { // an activity list does not exist, no activities for this user
            return res.status(400).send("You must add an activity list first!");
        }

        // update the session to indicate that a list has been provided
        req.session.activitiesListed = true;

        // get the list of activities for the identified statuses
        const list = await activityHeader.getActivity_todos(
            {where: {"status": {[Op.in]: statuses} }},
            {order: {"priority": "ASC"}});
        return res.status(200).send({list:list, message:"Your to do list for (" + statuses.toString() + ")"});

    } catch (error) {
        return res.status(500).send(error.message);
    }
    
}

// user may delete all to dos on an activity list [DELETE /todo ]
// user may delete a to do with a specific description. [/todo?description=description DELETE]
exports.delete = async (req, res, next) => {

    try {
        const description = req.query.description;

        // get the activity list record for the user
        userId = req.session.user;
        const activityHeader = await ActivityList.findOne({where: {owner: userId}});
        if (!activityHeader) { // an activity list does not exist, no activities for this user
            return res.status(400).send("You do not have any activities");
        }

        // delete the todo record or all of the todo records
        if (description) {
            await ToDo.destroy ({
                where:
                    {description: description,
                        activitylistId: activityHeader.id
                    }
            });
            return res.status(200).send("The to do with description'"+description+"' either did not exist or has been deleted.");
        } else { // delete all to dos for the user
            await ToDo.destroy ({
                where:
                    {activitylistId: activityHeader.id
                    }

            });
            return res.status(200).send("All to dos have been deleted.");
        }
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

// user may add to do [/todo POST parameters: description, /priority=1/]
exports.post = async (req, res) => {
    try {
        const description = req.query.description;
        const priorty = req.query.priority? req.query.priority: 1;
        const priority = Number.parseInt(req.query.priority);
        if (req.query.priority && isNaN(priority)) 
            return res.status(400).send("Priority number be a number!");

        // get the activity list record for the user
        userId = req.session.user;
        const activityHeader = await ActivityList.findOne({where: {owner: userId}});

        if (!activityHeader) { // an activity list does not exist, no activities for this user
            return res.status(400).send("You must add an activity list first");
        }

        // create an todo record
        const status = db.TODOSTATUSES[0];
        const todo = await ToDo.create({description:description, priority:priorty, status: status})

        // add it to the activity list
        await activityHeader.addActivity_todos (todo.id);
        return res.status(200).send(
            {description: description, priority: priority, status: status} );
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

// user may change the status or priority of a todo [/todo PUT parameters: description, /priority/, /status/ ]
//TODO a bit error prone on processing optional parameters
exports.put = async (req, res) => {
    try {

        const priority = Number.parseInt(req.query.priority);
        if (req.query.priority && isNaN(priority)) 
            return res.status(400).send("Priority number be a number!");
        const status = req.query.status;
        if (status && !isValidStatus(status))
            return res.status(400).send("'"+ status + "' is not a valid status for a to do!");
        const description = req.query.description;

        // find the user's activity list and then update the description
        const activityHeader = await ActivityList.findOne({where: {owner: userId}});

        if (!activityHeader) { // an activity list does not exist, no activities for this user
            return res.status(400).send("You must add an activity list first!");
        } 

        // get the existing todo record
        const todo = await ToDo.findOne({where:
            {
                description: description,
                activitylistId: activityHeader.id
                
            }});
        if (!todo) 
            return res.status(400).send("The to do with description '"+description+"' does not exist!");

        // construct the new todo record
        let newToDo = {description: todo.description};
        if (isNaN(priority)) 
        newToDo.priority = isNaN(priority)? priority: todo.priority;
        if (status)
        newToDo.status = status? status: todo.status;

        // update the todo record with the new data
        await todo.set(newToDo);
        return res.status(200).send({description: description, priority: priority, status: status});

    } catch (error) {
        return res.status(500).send(error.message);
    }
}
// helper function to check that an todo status is valid
function isValidStatus (status) {

    for (const validStatus of db.TODOSTATUSES) {
        if (status == validStatus)
            return  true;
    };

    return false;

}
