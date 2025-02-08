'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
    }
  }

  User.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    bookStoreId: DataTypes.INTEGER,
    ipAddress: DataTypes.STRING,
    lastLoginDate: DataTypes.DATE,
    role: {
      type: DataTypes.ENUM('ADMIN', 'USER', 'STOREMANAGER'),
      allowNull: false,
      defaultValue: 'USER',
    }
  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};
