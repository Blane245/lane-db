const db = require("../models");
const ActivityList = db.activitylist;
const Appointment = db.appointment;
var Op = db.Sequelize.Op;

//TODO test PUT, GET, and DELETE
const WSClient = require("../middleware/WSClients")
var wsClients = null;
exports.setClients = (clients) => {wsClients = clients};

// list appints - filter by date (today | tomorrow | week | all)
exports.get = async (req, res, next) => {
    try {

        // get the activity list record for the user
        const userId = req.session.userId;
        const activityHeader = await ActivityList.findOne({where: {owner: userId}});

        // get the appointment list for the current user
        const list = await activityHeader.getActivity_appointments();
        // and send it to all connections points for this user
        sendAppointments (userId, list, wsClients);
        return res.status(200).send();

    } catch (error) {
        return res.status(500).send({msg: error.message});
    }
    
}

// user may delete all to dos on an activity list [DELETE /api/appointments]
// user may delete a to do with a specific description. [DELETE /api/appointments?title=description]
exports.delete = async (req, res, next) => {

    try {
 
        // get the activity list record for the user
        const userId = req.session.userId;
        const activityHeader = await ActivityList.findOne({where: {owner: userId}});

        // delete the appointment record or all of the appointment records
        if (title) {
            await Appointment.destroy ({where:
                    {
                        title: title,
                        activitylistId: activityHeader.id
                    }
            });
        } else { // delete all appointments for the user
            await Appointment.destroy ({where:
                    {
                        activitylistId: activityHeader.id
                    }
            });
        }

        // get the appointment list for the current user
        const list = await activityHeader.getActivity_appointments();
        // and send it to all connections points for this user
        sendAppointments (userId, list, wsClients);
        return res.status(200).send();

    } catch (error) {
        return res.status(500).send({msg: error.message});
    }
}

// user may add an appointment [/api/appointment POST lots of request parameters]
exports.create = async (req, res) => {
    try {

        let verifiedRecord = {};
        const result = await verifyPOSTParameters (req.session.userId, req.body, verifiedRecord);
        if (result != "")
            return res.status(400).send({msg: result});
        
        // create the new appointment
        await Appointment.create(verifiedRecord);

        // get the activity list record for the user
        const activityHeader = await ActivityList.findOne({where: {owner: req.session.userId}});
    
        // add it to the activity list
        await activityHeader.addActivity_todos (verifiedRecord.id);

        // get the list of all appointments for the current user
        const list = await activityHeader.getActivity_appointments();
        // and send it to all connections points for this user
        sendAppointments (req.session.userId, list, wsClients);

        return res.status(200).send();

    } catch (error) {
        return res.status(500).send({msg: error.message});
    }
}

// user may change the data in an appointment [/appointment PUT parameters: lots ]
exports.put = async (req, res) => {
    try {

        let verifiedRecord = {};
        const result = await verifyPUTParameters (req.session.userId, req.query, verifiedRecord);
        if (result != "")
            return res.status(400).send({msg: result});

        // update the appointment record with the new data
        await Appointment.update(verifiedRecord, {where: {id: verifiedRecord.id}});

 
        // get the activity list record for the user
        const activityHeader = await ActivityList.findOne({where: {owner: req.session.userId}});
       // get the list of all appointments
        const list = await activityHeader.getActivity_appointments();
        // and send it to all connections points for this user
        sendAppointments (req.session.userId, list, wsClients);

        return res.status(200).send();
    } catch (error) {
        return res.status(500).send({msg: error.message});
    }
}

// help function to verify the correctness of add appointment parameters
// this is called with req.body for POST
// if everything is ok, a new appointment with the proper fields set is set as verifiedRecord, and returns a zero legnth string
async function verifyPOSTParameters (userId, json, verifiedRecord) {

    // get the activity list record for the user
    const activityHeader = await ActivityList.findOne({where: {owner: userId}});
    
    // check title presence
    const title = json.title;
    if (!title || title == "")
        return "Appointment title is required";

    // check for the presence of an appointment with that title
    const appointment = await Appointment.findOne({where: {
            title: title,
            activitylistId: activityHeader.id
        }});
    
    // an identical appoint must not exist when adding
    if (appointment) {
        return "An appointment with that title already exists";
    }

    let allday = json.allday;
    // allday
    if (!allday)
        allday = "false";
    if (!(allday == 'true' || allday == 'false'))
        return "allday must be true or false";

    // check if startdate or starttime or durction is present if allday is true
    let starttime = json.starttime;
    let startdate = json.startdate;
    let duration = json.duration;
    if (allday == 'true' && (startdate || starttime || duration))
        return "startdate, starttime, and duration should be not provided for an all day appointment";
    
    // check if startdate, starttime, and duration are present if allday is false
    if (allday == 'false' && !(startdate && starttime && duration))
        return "startdate, starttime, and duration are required if not an all day event";

    // check startdate, starttime, and duration formats
    if (allday == 'false') {
        if (!/^([0-9]{4,})-([0-9]{2,})-([0-9]{2,})/.test(startdate))
            return "startdate must be in the form yyyy-mm-dd";
        if (!/([0-9]{2,}):([0-9]{2,})/.test(json.starttime))
            return "starttime must be in the form hh:mm";
        startdate = new Date (startdate + "T"+starttime+":00");
        duration = Number.parseInt(duration);
        if (isNaN(duration) || duration < 0)
            return "duration must be a number greater than or equal to zero";
    }
    allday = (allday == "true") ? true: false;

    // check appoint repetition data. If it doesn't, then no repetition data shoud be provided
    let doesrepeat = json.doesrepeat;
    let repeaton = json.repeaton;
    let repeatinterval = json.repeatinterval;
    let repeatunit = json.repeatunit;
    let repeatends = json.repeatends;
    let repeatendson = json.repeatendson
    let repeatendsafter = json.repeatendsafter;
    if (!doesrepeat)
        doesrepeat = "false";
    if (!(doesrepeat == 'false' || doesrepeat == 'true'))
        return "doesrepeat must be 'true' or 'false' or not present";
    if (doesrepeat == 'false' && (
        repeaton || repeatinterval || repeatunit || repeatends || repeatendson || repeatendsafter))
        return "Appointment repetition information must not be provided if an appointment does not repeat";
    if (doesrepeat == 'true' && (!repeaton || !repeatinterval || !repeatunit))
        return "Appointment repetition data must be provided if an appointment is to be repeated";

    if (doesrepeat == "true") {
        
        // check the basic repeat data 
        repeatinterval = Number.parseInt(repeatinterval);
        if (isNaN(repeatinterval) || repeatinterval < 1)
            return "Appointment repetition interval must be a number greater than 0";
        if (!db.REPEATUNITS.includes(repeatunit))
            return "Appointment repetition unit must 'week', 'day', 'month', or 'year'";
        // verify repeats on as a char of length 7 and having only zeros and ones
        if (!/^([0-1]{7,})/.test(repeaton))
            return "Appointment repeatson must be a character string of length 7 and containing only zeroes and ones";

        // check the repeat ends
        
        if (!repeatends)
            repeatends = "never";
        if (!db.REPEATENDS.includes(repeatends))
            return "Appointment repetition ends must be 'never', 'on', or 'after'";
        if (repeatendson && repeatendsafter) 
            return "Appointment repetition end 'on' and 'after' cannot both be provided";
        if (repeatends == "on" && (!repeatendson || !/^([0-9]{4,})-([0-9]{2,})-([0-9]{2,})/.test(repeatendson)))
            return "Appointment repetition ends on must be provided and in the form yyyy-mm-dd";
        else if (repeatendson == "on")
            repeatendson = new Date(repeatendson);
        repeatendsafter = Number.parseInt(repeatendsafter);
        if (repeatends == "after" && (isNaN(repeatendsafter) || repeatendsafter <=1))
            return "Appointment repetition ends after must be provided and be a number greater than 1";
    }
    doesrepeat = (doesrepeat == "true") ? true:false;

    // on a GET the appointment is initialialized to the current record and the option 'newtitle' is picked up

    verifiedRecord.title = json.title;
    verifiedRecord.activitylistId =  activityHeader.id;
    if (json.description) verifiedRecord.description = json.description;
    if (json.withwhom) verifiedRecord.withwhom = json.withwhom;
    if (json.location) verifiedRecord.location = json.location;
    verifiedRecord.allday = allday;
    if (startdate) verifiedRecord.startdate = startdate;
    if (duration) verifiedRecord.duration = duration;
    verifiedRecord.doesrepeat = doesrepeat;
    if (repeaton) verifiedRecord.repeaton = repeaton;
    if (repeaton) verifiedRecord.repeaton = repeaton;
    if (repeatinterval) verifiedRecord.repeatinterval = repeatinterval;
    if (repeatunit) verifiedRecord.repeatunit = repeatunit;
    if (repeatends) verifiedRecord.repeatends = repeatends;
    if (repeatendsafter) verifiedRecord.repeatendsafter = repeatendsafter;

    // return a null string is everythin is ok
    return "";
}


// help function to verify the correctness of add appointment parameters
// this is called with req.body for PUT
// if everything is ok, a new appointment with the proper fields set is set as verifiedRecord, and returns a zero legnth string
async function verifyPUTParameters (userId, json, verifiedRecord) {

    // get the activity list record for the user
    const activityHeader = await ActivityList.findOne({where: {owner: userId}});
    
    // check title presence
    const title = json.title;
    if (!title || title == "")
        return "Appointment title is required";

    // check for the presence of an appointment with that title
    const appointment = await Appointment.findOne({where: {
            title: title,
            activitylistId: activityHeader.id
        }});
    
    // an the appointment record must exit
    if (!appointment) {
        return "An appointment with that title does not exists";
    }

    // get up the changes from the PUT transaction
    verifiedRecord = appointment;

    // check for new appointment title
    const newTitle = json.newtitle;
    if (newTitle) {
        const trialAppointment = await Appointment.findOne({where: {
            title: newTitle,
            activitylistId: activityHeader.id
        }});
        if (trialAppointment)
            return "An appointment with name '" + newTitle + "' already exists" ;
        else
            verifiedRecord.title = newTitle;
    }

    const allday = json.allday;
    // allday
    if (allday & !(allday == 'true' || allday == 'false'))
        return "allday must be true or false";
    if (allday) verifiedRecord = allday;

    let startDate = json.startdate;
    if (startDate && !/^([0-9]{4,})-([0-9]{2,})-([0-9]{2,})/.test(startDate)) {
        return "startdate must be in the form yyyy-mm-dd";
    }
    let startTime = json.startTime;
    if (startTime && !/([0-9]{2,}):([0-9]{2,})/.test(startTime))
        return "starttime must be in the form hh:mm";
    // TODO trickey here. User might only provide startdate or starttime and expect that the db record for the other value
    // stays the same

    let duration = json.duration;
    let parsedDuration = null;
    if (duration) {
        parsedDuration = Number.parseInt(duration);
        if (isNaN(parsedDuration) || parsedDuration < 0)
            return "duration must be a number greater than or equal to zero";
    }
    if (duration)
        verifiedRecord.duration = parsedDuration;

    let doesRepeat = json.doesrepeat;
    if (doesRepeat && !(doesRepeat == 'false' || doesRepeat == 'true'))
        return "doesrepeat must be 'true' or 'false' or not present";
    if (doesRepeat) verifiedRecord.doesrepeat = doesRepeat;
    let repeatOn = json.repeaton;
    // verify repeats on as a char of length 7 and having only zeros and ones
    if (repeatOn && !/^([0-1]{7,})/.test(repeatOn))
        return "Appointment repeaton must be a character string of length 7 and containing only zeroes and ones";
    if (repeatOn) verifiedRecord.repeaton = repeatOn;
    let repeatInterval = json.repeatinterval;
    let parsedRepeatInterval = null;
    if (repeatInterval) {
        parsedRepeatInterval = Number.parseInt(repeatInterval)
        if (isNaN(parsedRepeatInterval) || parsedRepeatInterval < 1)
            return "Appointment repetition interval must be a number greater than 0";
    }
    if (repeatInterval) verifiedRecord.repeatinterval = parsedRepeatInterval;

    let repeatUnit = json.repeatunit;
    if (repeatUnit && !db.REPEATUNITS.includes(repeatUnit))
        return "Appointment repetition unit must 'week', 'day', 'month', or 'year'";
    if (repeatUnit) verifiedRecord.repeatunit = repeatUnit;

    let repeatEnds = json.repeatends;
    if (repeatEnds && !db.REPEATENDS.includes(repeatEnds))
        return "Appointment repetition ends must be 'never', 'on', or 'after'";
    if (repeatEnds) verifiedRecord.repeatends = repeatEnds;

    let repeatEndsOn = json.repeatendson
    if (repeatEndsOn && (!repeatEndsOn || !/^([0-9]{4,})-([0-9]{2,})-([0-9]{2,})/.test(repeatEndsOn)))
        return "Appointment repetition ends on must be provided and in the form yyyy-mm-dd";
    if (repeatEndsOn) verifiedRecord.repeatendson = repeatEndsOn;

    let repeatEndsAfter = json.repeatendsafter;
    let parsedRepeatEndsAfter = null;
    if (repeatEndsAfter) {
        parsedRepeatEndsAfter = Number.parseInt(repeatEndsAfter);
        if (isNaN(parsedRepeatEndsAfter) || parsedRepeatEndsAfter <= 1)
            return "Appointment repetition ends after must be provided and be a number greater than 1";
    }
    if (repeatEndsAfter) verifiedRecord.repeatendsafter = parsedRepeatEndsAfter;

    // verifiedRecord has been built up, make it conform to allday and repeating rules
    if (verifiedRecord.allday) {
        verifiedRecord.startdate = null;
        verifiedRecord.duration = null;
    } else {
        if (!verifiedRecord.startdate || !verifiedRecord.duration)
            return ("an appointment that is not all day must have a startdate and duration");
    }
    if (!verifiedRecord.doesrepeat) {
        verifiedRecord.repeatends = null;
        verifiedRecord.repeatendsafter = null;
        verifiedRecord.repeatendson = null;
        verifiedRecord.repeatinterval = null;
        verifiedRecord.repeaton = null;
        verifiedRecord.repeatunit = null;
    } else {
        if (!verifiedRecord.repeaton)
            return "Appointment repeaton must be a character string of length 7 and containing only zeroes and ones";
        if (verifiedRecord.repeatends == "never") {
            verifiedRecord.repeatendsafter = null;
            verifiedRecord.repeatendson = null;
        } else if (verifiedRecord.repeatends == "on") {
            verifiedRecord.repeatendsafter = null;
            if (!verifiedRecord.repeatendson)
                return "Appointment repetition ends on must be provided and in the form yyyy-mm-dd";
        } else {
            verifiedRecord.repeatendson = null;
            if (!verifiedRecord.repeatendsafter)
                return "Appointment repetition ends after must be provided and be a number greater than 1";
        }

    }

    // return a null string is everythin is ok
    return "";
}


// send the appointment list to all connection points for the current user
const { emitUserMessage } = require("../middleware/emitMessage");
function sendAppointments (userId, list, wsClients) {
    emitUserMessage (userId, {type: "appointments", data: list}, wsClients);
}
