module.exports = (sequelize, Sequelize) => {
  const Room = sequelize.define("rooms", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
  roomname: {type: Sequelize.STRING}, // name of the user who sent the message
  });

  return Room;
};
