module.exports = (sequelize, Sequelize) => {
  const Appointment = sequelize.define("appointments", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
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
  });

  return Appointment;
};
