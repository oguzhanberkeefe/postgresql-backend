'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const process = require('process');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const basename = path.basename(__filename);
fs.readdirSync(__dirname)
  .filter(file => file !== basename && file.endsWith('.js'))
  .forEach(file => {
    const modelImport = require(path.join(__dirname, file));
    const model = modelImport(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.User.hasMany(db.UserLoginLogs, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.UserLoginLogs.belongsTo(db.User, { foreignKey: 'userId', onDelete: 'CASCADE' });

db.BookStores.hasOne(db.User, { foreignKey: 'bookStoreId', as: 'storeManager', onDelete: 'CASCADE' });
db.User.belongsTo(db.BookStores, { foreignKey: 'bookStoreId', as: 'store' });

db.BookStores.hasMany(db.Books, { foreignKey: 'bookStoreId', onDelete: 'CASCADE' });
db.Books.belongsTo(db.BookStores, { foreignKey: 'bookStoreId', onDelete: 'CASCADE' });

db.Authors.hasMany(db.Books, { foreignKey: 'authorId', onDelete: 'CASCADE' });
db.Books.belongsTo(db.Authors, { foreignKey: 'authorId', onDelete: 'CASCADE' });

db.Books.hasMany(db.Inventory, { foreignKey: 'bookId', onDelete: 'CASCADE' });
db.Inventory.belongsTo(db.Books, { foreignKey: 'bookId', onDelete: 'CASCADE' });

db.BookStores.hasMany(db.Inventory, { foreignKey: 'bookstoreId', onDelete: 'CASCADE' });
db.Inventory.belongsTo(db.BookStores, { foreignKey: 'bookstoreId', onDelete: 'CASCADE' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
