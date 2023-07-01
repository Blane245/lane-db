const db = require("../models");
const ActivityList = db.activitylist;
const ToDo = db.todo;
var Op = db.Sequelize.Op;

//TODO: due date not storing or updating


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
                        return res.status(400).send({msg: "'"+ status + "' is not a valid status for an to do!"});
                    }
                };
            } else {
                statuses.push(statusList);
            }
        } else
            statuses = db.TODOSTATUSES;
        // build up the where clause based on the date

        let whereClause = {"status": {[Op.in]: statuses} };
        const dateSelect = req.query.date;
        if (!dateSelect && !dateSelect == 'all' && !dateSelect == 'today' && !dateSelect == 'tomorrow') {
            return res.status(400).send({msg: "The date must be 'all', 'today', tomorrow', or not specified"});
        }
        let trialDate = null;
        switch (dateSelect) {
            case 'all':
                break;
            case 'today':
                trialDate = Date.now();
                break;
            case 'tomorrow':
                trialDate = Date.setTime(Date.now() + 24 * 1000 * 60 * 60);
                break;
            default:
                break;
        }
        if (trialDate) {
            const formatedDate = new Intl.DateTimeFormat('en-US',
                {year:"4-digit", 
                month:'2-digit', 
                day:'2-digit', 
                pattern: '{year}/{month}/{day}'}).format(trialDate);
            whereClause = {[Op.and]: [
                whereClause,
                {"dueDate": {[Op.le]: formatedDate}}
            ]}
        }

        // get the activity list record for the user
        userId = req.session.userId;
        const activityHeader = await ActivityList.findOne({where: {owner: userId}});

        if (!activityHeader) { // an activity list does not exist, no activities for this user
            return res.status(400).send({msg: "You must add an activity list first!"});
        }

        // get the list of activities for the identified statuses
        const list = await activityHeader.getActivity_todos(
            {where: whereClause},
            {order: {"priority": "DEC"}});
        return res.status(200).send({list:list});

    } catch (error) {
        return res.status(500).send({msg: error.message});
    }
    
}

// user may delete all to dos on an activity list [DELETE /todo ]
// user may delete a to do with a specific description. [/todo?description=description DELETE]
exports.delete = async (req, res, next) => {

    try {
        const description = req.query.description;

        // get the activity list record for the user
        userId = req.session.userId;
        const activityHeader = await ActivityList.findOne({where: {owner: userId}});
        if (!activityHeader) { // an activity list does not exist, no activities for this user
            return res.status(400).send({msg: "You do not have any activities"});
        }

        // delete the todo record or all of the todo records
        if (description) {
            await ToDo.destroy ({
                where:
                    {description: description,
                        activitylistId: activityHeader.id
                    }
            });
            return res.status(200).send({msg: "The to do with description'"+description+"' either did not exist or has been deleted."});
        } else { // delete all to dos for the user
            await ToDo.destroy ({
                where:
                    {activitylistId: activityHeader.id
                    }

            });
            return res.status(200).send({msg: "All to dos have been deleted."});
        }
    } catch (error) {
        return res.status(500).send({msg: error.message});
    }
}

// user may add to do [/todo POST parameters: description, /priority=1/]
exports.post = async (req, res) => {
    try {

        // get the activity list record for the user
        userId = req.session.userId;
        const activityHeader = await ActivityList.findOne({where: {owner: userId}});

        if (!activityHeader) { // an activity list does not exist, no activities for this user
            return res.status(400).send({msg: "You must add an activity list first"});
        }
        // check description
        const description = req.body.description;
        if (!description || description == "") {
            return res.status(400).send({msg: "Description must be provided and not blank!"});
        }

        // check proirity
        const priorty = req.body.priority? req.body.priority: 1;
        const priority = Number.parseInt(req.body.priority);
        if (req.body.priority && isNaN(priority)) 
            return res.status(400).send({msg: "Priority number be a number!"});

        // check due date
        const duedate = req.body.duedate;
        if (duedate) {
            // must have the form yyyy/mm/dd
            if (!/^([0-9]{4,})\/([0-9]{2,})\/([0-9]{2,})/.test(duedate)) {
                return res.status(400).send({msg: "Due Date must be in the form yyyy/mm/dd"});
            }
        }

        // create an todo record
        const status = db.TODOSTATUSES[0];
        const todo = await ToDo.create({description:description, priority:priorty, status: status, duedate: duedate})

        // add it to the activity list
        await activityHeader.addActivity_todos (todo.id);
        return res.status(200).send({description: description, priority: priority, status: status, duedate:duedate} );
    } catch (error) {
        return res.status(500).send({msg: error.message});
    }
}

// user may change the status or priority of a todo [/todo PUT parameters: description, /priority/, /status/ ]
exports.put = async (req, res) => {
    try {

        // check that an activity list exists
        const activityHeader = await ActivityList.findOne({where: {owner: userId}});

        if (!activityHeader) { // an activity list does not exist, no activities for this user
            return res.status(400).send({msg: "You must add an activity list first!"});
        } 

        // verify description
        const description = req.query.description;
        if (!description || description == "") {
            return res.status(400).send({msg: "Description must be provided and not blank!"});
        }

        // get the existing todo record
        const todo = await ToDo.findOne({where:
            {
                description: description,
                activitylistId: activityHeader.id
                
            }});
        if (!todo) 
            return res.status(400).send({msg: "The to do with description '"+description+"' does not exist!"});


        // verify priority
        let priority = Number.parseInt(req.query.priority);
        if (req.query.priority && isNaN(priority)) 
            return res.status(400).send({msg: "Priority number be a number!"});
        
        // verify status
        const status = req.query.status;
        if (status && !isValidStatus(status))
            return res.status(400).send({msg: "'"+ status + "' must be 'todo', 'inprogress', or 'done'!"});

        // verify duedate
        const duedate = req.query.duedate;
        if (duedate && duedate != "none") {
            // must have the form yyyy/mm/dd
            if (!/^([0-9]{4,})\/([0-9]{2,})\/([0-9]{2,})/.test(duedate)) {
                return res.status(400).send({msg: "Due Date must be in the form yyyy/mm/dd or 'none'"});
            }
        }

        // construct the new todo record
        let newToDo = {description: todo.description};
        newToDo.priority = isNaN(priority)? priority: todo.priority;
        if (status)
            newToDo.status = status? status: todo.status;
        if (duedate) {
            if (duedate == "none")
                newToDo.duedate = null;
            else
                newToDo.dueDate = duedate;
        }

        // update the todo record with the new data
        await todo.set(newToDo);
        return res.status(200).send({description: description, priority: priority, status: status, duedate: duedate});

    } catch (error) {
        return res.status(500).send({msg: error.message});
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
