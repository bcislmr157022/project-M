require('dotenv').config();

module.exports = {
  database: 'birth_monitoring',
  username: 'postgres',
  password: 'muhiadenis',
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: console.log, // Remove in production
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true
  }
};