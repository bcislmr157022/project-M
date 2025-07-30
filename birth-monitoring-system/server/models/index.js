const { Sequelize } = require('sequelize');
const config = require('../config/database');

// Initialize Sequelize with PostgreSQL
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    dialectOptions: config.dialectOptions,
    logging: config.logging,
    pool: config.pool,
    define: config.define
  }
);

const db = {
  sequelize,
  Sequelize
};

// Load models
db.User = require('./User')(sequelize);
db.Birth = require('./Birth')(sequelize);
db.MaternalHealth = require('./MaternalHealth')(sequelize);
db.BirthComplication = require('./BirthComplication')(sequelize);

// Set up associations
Object.keys(db).forEach(modelName => {
  if (db[modelName] && db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;