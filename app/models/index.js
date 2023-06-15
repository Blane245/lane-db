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
db.activity = require("./activity.model.js")(sequelize, Sequelize);

// build the manay to many relationship between users and roles
db.role.belongsToMany(db.user, {
  through: "users_roles"
});
db.user.belongsToMany(db.role, {
  through: "users_roles"
});
db.activity.belongsTo(db.activitylist, {
  through: "list_activities"
});

db.ROLES = ["user", "admin", "moderator"];
module.exports = db;