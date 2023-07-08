module.exports = {
    HOST: "localhost",
    PORT: 3306,
    DB: process.env.DB,
    USER: process.env.DBUSER,
    PASSWORD: process.env.DBPASSWORD,
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };