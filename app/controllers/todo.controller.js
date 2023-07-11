const db = require("../models");
const ActivityList = db.activitylist;
const ToDo = db.todo;
var Op = db.Sequelize.Op;
const WSClient = require("../middleware/WSClients")
var wsClients = null;
exports.setClients = (clients) => {
    wsClients = clients;
};

// get the current user's todo list
exports.get = async (req, res, next) => {
    try {

        // get the activity list record for the user
        const userId = req.session.userId;
        const activityHeader = await ActivityList.findOne({where: {owner: userId}});

        // get the todo list for the current user
        const list = await activityHeader.getActivity_todos();

        // and send it to all connections points for this user
        sendToDos (userId, list, wsClients);
        return res.status(200).send();

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
        const userId = req.session.userId;
        const activityHeader = await ActivityList.findOne({where: {owner: userId}});

        // delete the todo record or all of the todo records
        if (description) {
            await ToDo.destroy ({
                where:
                    {
                        description: description,
                        activitylistId: activityHeader.id
                    }
            });

            // get the todo list for the current user
            const list = await activityHeader.getActivity_todos();
            // and send it to all connections points for this user
            sendToDos (userId, list, wsClients);
            return res.status(200).send();

        } else { // delete all to dos for the user
            await ToDo.destroy ({
                where:
                    {activitylistId: activityHeader.id}

            });
            // and send it to all connections points for this user
            sendToDos (userId, list, wsClients);
            return res.status(200).send();
        }
    } catch (error) {
        return res.status(500).send({msg: error.message});
    }
}

// user may add to do [/todo POST parameters: description, (priority=1), (duedate=yyyy/mm/dd)]
exports.post = async (req, res) => {
    try {

        // get the activity list record for the user
        const userId = req.session.userId;
        const activityHeader = await ActivityList.findOne({where: {owner: userId}});

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
        let duedate = req.body.duedate;
        if (duedate) {
            // must have the form yyyy/mm/dd
            if (!/^([0-9]{4,})\/([0-9]{2,})\/([0-9]{2,})/.test(duedate)) {
                return res.status(400).send({msg: "Due Date must be in the form yyyy/mm/dd"});
            }
        }

        // create an todo record
        const status = db.TODOSTATUSES[0];
        
        const todo = await ToDo.create({description:description, 
            priority:priorty, 
            status: status, 
            duedate: (duedate)?new Date(duedate):null})

        // add it to the activity list
        await activityHeader.addActivity_todos (todo.id);

        // get the todo list for the current user
        const list = await activityHeader.getActivity_todos();
        // and send it to all connections points for this user
        sendToDos (userId, list, wsClients);
        return res.status(200).send();

    } catch (error) {
        return res.status(500).send({msg: error.message});
    }
}

// user may change the status or priority of a todo [/todo PUT parameters: description, /priority/, /status/ ]
exports.put = async (req, res) => {
    try {

        const userId = req.session.userId;
        // check that an activity list exists
        const activityHeader = await ActivityList.findOne({where: {owner: userId}});

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
        newToDo.priority = isNaN(priority)? todo.priority: priority;
        if (status)
            newToDo.status = status? status: todo.status;
        if (duedate) {
            if (duedate == "none")
                newToDo.duedate = null;
            else
                newToDo.duedate = new Date(duedate);
        }

        // update the todo record with the new data
        await todo.update(newToDo, {where: {id: todo.id}});

        // get the todo list for the current user
        const list = await activityHeader.getActivity_todos();
        // and send it to all connections points for this user
        sendToDos (userId, list, wsClients);
        return res.status(200).send();

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

// send the todo list to all connection points for the curren user
const { emitUserMessage } = require("../middleware/emitMessage");
function sendToDos (userId, list, wsClients) {
    emitUserMessage (userId, {type: "todos", data: list}, wsClients);
}

