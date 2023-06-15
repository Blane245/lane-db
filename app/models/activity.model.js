module.exports = (sequelize, Sequelize) => {
  const Activity = sequelize.define("activities", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
  },
  description: Sequelize.STRING, // the description of this activity
  // many attributes to follow
  });

  return Activity;
};
