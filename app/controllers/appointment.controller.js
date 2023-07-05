const db = require("../models");
const ActivityList = db.activitylist;
const Appointment = db.appointment;
var Op = db.Sequelize.Op;



// list appints - filter by date (today | tomorrow | week | all)
exports.get = async (req, res, next) => {
    try {

        res.status(501).send({msg:"list appointments not yet implemented"});

    } catch (error) {
        return res.status(500).send({msg: error.message});
    }
    
}

// user may delete all to dos on an activity list [DELETE /todo ]
// user may delete a to do with a specific description. [/todo?description=description DELETE]
exports.delete = async (req, res, next) => {

    try {

        res.status(501).send({msg:"delete appointments not yet implemented"});

    } catch (error) {
        return res.status(500).send({msg: error.message});
    }
}

// user may add to do [/todo POST parameters: description, /priority=1/]
exports.create = async (req, res) => {
    try {

        res.status(501).send({msg:"add appointments not yet implemented"});

    } catch (error) {
        return res.status(500).send({msg: error.message});
    }
}

// user may change the status or priority of a todo [/todo PUT parameters: description, /priority/, /status/ ]
exports.put = async (req, res) => {
    try {

        res.status(501).send({msg:"modify appointments not yet implemented"});

    } catch (error) {
        return res.status(500).send({msg: error.message});
    }
}

// help function to verify the correctness of add and modify appoint parameters
// this is called with req.body for POST and req.query for GET
// if everything is ok, a new appointment with the proper fields set is set as verifiedRecord, and returns a zero legnth string
async function verifyParameters (type, json, verifiedRecord) {

    // get the activity list record for the user
    userId = req.session.userId;
    const activityHeader = await ActivityList.findOne({where: {owner: userId}});
    if (!activityHeader) { // an activity list does not exist, no activities for this user
        return res.status(400).send({msg: "You must add an activity list first!"});
    }

    // check title presence
    const title = json.title;
    if (!title || title == "")
        return "Appointment title is required";

    // check for the presence of an appoint with that title
    const appointment = await Appointment.findOne({where: {
            title: title,
            activitylistId: activityHeader.id
        }});
    
    // an identical appoint must not exist when adding
    if (type == 'POST') {
        return "An appointment with that title already exists";
    }

    let allday = json.allday;
    // allday
    if (!allday)
        allday = "false"
    if (!allday == 'true' || json == 'false')
        return "allday must be true or false";

    // check if startdate or starttime or durction is present if allday is true
    let starttime = json.starttime;
    let startdate = json.startdate;
    let duration = json.duration;
    if (allday == 'true' && (startdate || starttime || duration))
        return "startdate, starttime, and endtime should be not provided for an all day appointment";
    
    // check if startdate, starttime, and duration are present if allday is false
    if (allday == 'false' && !startdate && !starttime && !duration)
        return "startdate, starttime, and endtime must be not provided is this is not an all date appointment";

    // check startdate, starttime, and duration formats
    if (allday == 'false') {
        if (!/^([0-9]{4,})\/([0-9]{2,})\/([0-9]{2,})/.test(startdate))
            return "startdate must be in the form yyyy/mm/dd";
        else
            startdate = new Date(startdate);
        if (!/([0-9]{2,}):([0-9]{2,})/.test(json.starttime))
            return "starttime must be in the form hh:mm";
        else
            starttime = new Date(starttime);
        duration = Number.parseInt(duration);
        if (isNaN(duration) || duration < 0)
            return "duration must be a number greater than or equal to zero";
    }
    allday = allday == "true" ? true: false;

    // check appoint repetition data. If it doesn't, then no repetition data shoud be provided
    const doesrepeat = json.doesrepeat;
    const repeaton = json.repeaton;
    const repeatinterval = json.repeatinterval;
    const repeatunit = json.repeatinterval;
    const repeatends = json.repeatends;
    const repeatendson = json.repeatendson
    const repeatendsafter = json.repeatendsafter;
    if (!doesrepeat)
        doesrepeat = false;
    if (!doesrepeat == 'false' || doesrepeat == 'true')
        return "doesrepeat must be 'true' or 'false' or not present";
    if (doesrepeat == 'false' && (
        repeaton || repeatinterval || repeatunit || repeatends || repeatendson || repeatendsafter))
        return "Appointment repetition information must not be provided if an appoitnemtn does not repeat";
    if (doesrepeat == 'true' && !repeaton && !repeatinterval && !repeatunit)
        return "Appointment repetition data must be provided if an appoint is to be repeated";

    if (doesrepeat == "true") {
        
        // check the basic repeat data 
        repeatinterval = Number.parseInt(repeatinterval);
        if (isNaN(repeatinterval) || repeatinterval < 1)
            return "Appointment repetition interval must be a number greater than 0";
        if (!db.REPEATUNITS.includes(repeatunit))
            return "Appointment repetition unit must 'week', 'day', 'month', or 'year'";
        //TODO verify repeats on as a char of length 7 and having only zeros and ones
        if (!/^([0-1]{7,})/.test(repeaton))
            return "Appointment repeatson must be a character string of length 7 and containing only zeroes and ones";

        // check the repeat ends 
        if (!repeatends)
            repeatends = "never";
        if (!db.REPEATENDS.includes(repeatends))
            return "Appointment repetition ends must be 'never', 'on', or 'after'";
        if (repeatendson && repeatendsafter) 
            return "Appointment repetition end 'on' and 'after' cannot both be provided";
        if (repeatends == "on" && (!repeatendson || !/^([0-9]{4,})\/([0-9]{2,})\/([0-9]{2,})/.test(repeatendson)))
            return "Appointment repetition ends on must be provided and in the form yyyy/mm/dd";
        else
            repeatendson = new Date(repeatendson);
        repeatendsafter = Number.parseInt(repeatendsafter);
        if (repeatends == "after" && (isNaN(repeatendsafter) || repeatendsafter <=1))
            return "Appointment repetition ends after must be provided and be a number greater than 1";
    }
    doesrepeat = doesrepeat == "true"? true:false;

    if (type == "GET")
        verifiedRecord.id = appointment.id;
    verifiedRecord = {title: title};
    if (type == "POST")
        verifiedRecord.

        title: Sequelize.STRING,
        description: Sequelize.STRING, // the description of this activity
        withwhom: Sequelize.STRING, // who is appointment with
        location: Sequelize.STRING, // where the appoint is 
        allday: Sequelize.BOOLEAN, // tue if the appoint is all day
        startdate: Sequelize.DATEONLY, // date when the appointment starts
        starttime: Sequelize.TIME,  // time of day when the appointment(s) start
        duration: Sequelize.INTEGER,   // the number of minutes in the appointment
        doesrepeat: Sequelize.BOOLEAN, // true if the appoint repeats
        repeaton: Sequelize.CHAR(7), // 0 = not on this day, 1 - on this day, 0 = Sunday
        repeatinterval: Sequelize.INTEGER, // how often the appointment repeats, e.g., 2 weeks is every two weeks
        repeatunit: Sequelize.ENUM("week", "day", "month", "year"), // the repeat unit
        repeatends: Sequelize.ENUM("never", "on", "after"), // when a repeating appointment ends
        repeatendson: Sequelize.DATEONLY, // the day when a repeating appointment ends
        repeatendsafter: Sequelize.INTEGER, // the number of occurrences of a repeating appointment
    



    // return a null string is everythin is ok
    return "";
}
