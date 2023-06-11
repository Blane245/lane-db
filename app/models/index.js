const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
console.log(dbConfig);
const sequelize = new Sequelize (dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  port: dbConfig.PORT,
  dialect: dbConfig.dialect,
    pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./user.model.js")(sequelize, Sequelize);
db.role = require("./role.model.js")(sequelize, Sequelize);
db.activitylist = require("./activitylist.model.js")(sequelize, Sequelize);
db.users_roles = require("./users-roles.model.js")(sequelize, Sequelize);

db.ROLES = ["user", "admin", "moderator"];
module.exports = db;