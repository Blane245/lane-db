module.exports = (sequelize, Sequelize) => {
  const Activity = sequelize.define("activities", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
  },
  description: Sequelize.STRING, // the description of this activity
  priority: Sequelize.INTEGER, 
  status: Sequelize.STRING, // TODO, INPROGRESS, COMPLETE
  // many attributes to follow
  });

  return Activity;
};
