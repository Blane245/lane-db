const { appointment } = require("../models");

activityListController = require("./activityList.controller");
appointmentContoller = require("./appointment.controller");
authController = require("./auth.controller");
toDoController = require("./todo.controller");
userController = require("./user.controller");
versionController = require("./version.controller");

exports.set = (wsClients) => {
    activityListController.setClients(wsClients);
    appointmentContoller.setClients(wsClients);
    authController.setClients(wsClients);
    toDoController.setClients(wsClients);
    userController.setClients(wsClients);
    versionController.setClients(wsClients);
}