module.exports = {
    HOST: "localhost",
    PORT: 3306,
    DB: "lane_db",
    USER: process.env.DBUSER,
    PASSWORD: process.env.PASSWORD,
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };