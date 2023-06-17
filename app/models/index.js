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

// build the relationships models
db.role.belongsToMany(db.user, {
  through: "users_roles"
});
db.user.belongsToMany(db.role, {
  through: "users_roles"
});
db.activitylist.hasMany(db.activity, {
  as: "ToDos"
});
db.activitylist.belongsTo(db.user, {
  through: "users_list"
})

db.ROLES = ["user", "admin", "moderator"];
db.ACTIVITYSTATUSES = ["todo", "inprogress", "done"]
module.exports = db;