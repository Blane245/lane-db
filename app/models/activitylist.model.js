module.exports = (sequelize, Sequelize) => {
  const ActivityList = sequelize.define("activitylists", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
  },
  owner: {
      type: Sequelize.STRING
    },
  });

  return ActivityList;
};
