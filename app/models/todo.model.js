module.exports = (sequelize, Sequelize) => {
  const ToDo = sequelize.define("todos", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
  },
  description: Sequelize.STRING, // the description of this activity
  priority: Sequelize.INTEGER, 
  dueDate: Sequelize.DATE,   // yyyy-mm-dd
  status: Sequelize.STRING, // one of db.TODOSTATUSES
  });

  return ToDo;
};
