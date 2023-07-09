module.exports = (sequelize, Sequelize) => {
  const Appointment = sequelize.define("appointments", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: Sequelize.STRING,
    description: Sequelize.STRING, // the description of this activity
    withwho: Sequelize.STRING, // who is appointment with
    allday: Sequelize.BOOLEAN,
    starttime: Sequelize.DATE,   // date and time
    endtime: Sequelize.DATE, // date and time
    doesrepeat: Sequelize.BOOLEAN,
    repeatinterval: Sequelize.INTEGER,
    repeatunit: Sequelize.ENUM("week", "day", "month", "year"),
    repeatends: Sequelize.ENUM("never", "on", "after"),
    repeatendson: Sequelize.DATEONLY,
    repeatendsafter: Sequelize.INTEGER,
  });

  return Appointment;
};
