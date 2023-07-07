module.exports = (sequelize, Sequelize) => {
  const ActivityList = sequelize.define("activitylists", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
  },
  owner: {
      type: Sequelize.INTEGER, // the id of the user ownning this activity list
    },
  });

  return ActivityList;
};
