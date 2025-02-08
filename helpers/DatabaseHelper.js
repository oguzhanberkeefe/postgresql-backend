const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectModule: require('pg'),
    logging: false,
});

sequelize.authenticate()
    .then(() => console.log('Veritabanı bağlantısı kuruldu'))
    .catch((err) => console.error('Veritabanı bağlantı hatası:', err));

module.exports = sequelize;
