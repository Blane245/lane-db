const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize (
  dbConfig.DB, 
  dbConfig.USER, 
  dbConfig.PASSWORD, 
  {
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    dialect: dbConfig.dialect,
      pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./user.model.js")(sequelize, Sequelize);
db.role = require("./role.model.js")(sequelize, Sequelize);
db.activitylist = require("./activitylist.model.js")(sequelize, Sequelize);
db.todo = require("./todo.model.js")(sequelize, Sequelize);
db.appointment = require("./appointment.model.js")(sequelize, Sequelize);

// build the relationships models

// users and roles are mant-to-many
db.role.belongsToMany(db.user, {
  through: "users_roles"
});
db.user.belongsToMany(db.role, {
  through: "users_roles"
});

// only one activity list allowed per user
db.activitylist.belongsTo(db.user, {
  through: "user_activity"
})

// many todos for an activity list
db.activitylist.hasMany(db.todo, {
  as: "activity_todos"
});

// many appointments for an activity list
db.activitylist.hasMany(db.appointment, {
  as: "activity_appointments"
});

db.ROLES = ["user", "admin", "moderator"];
db.TODOSTATUSES = ["todo", "inprogress", "done"];
db.REPEATUNITS = ["week", "day", "month", "year"];
db.REPEATENDS = ["never", "on", "after"];
module.exports = db;