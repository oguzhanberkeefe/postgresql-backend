'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserLoginLogs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserLoginLogs.init({
    userId: DataTypes.INTEGER,
    ipAddress: DataTypes.STRING,
    loginDate: DataTypes.DATE,
    browser: DataTypes.STRING,
    deviceInfo: DataTypes.STRING,
    osInfo: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'UserLoginLogs',
  });
  return UserLoginLogs;
};