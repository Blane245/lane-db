module.exports = (sequelize, Sequelize) => {
  const ChatMessage = sequelize.define("chatmessages", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {type: Sequelize.STRING}, // name of the user who sent the message
    message: {type: Sequelize.STRING},
    time: {type: Sequelize.DATE}
  });

  return ChatMessage;
};
