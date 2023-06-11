module.exports = (sequelize, Sequelize) => {
    const Users_Roles = sequelize.define("Users_Roles", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        userId: {
            type: Sequelize.INTEGER,
        },
        roleId: {
            type: Sequelize.INTEGER,
        },
    });
    Users_Roles.associate = models => {
        Users_Roles.belongsto(models.User, {
            foreignKey: 'userId',
        });
        Users_Roles.belongsto(models.Role, {
            foreignKey: 'roleId',
        });
    }
    return Users_Roles;
}