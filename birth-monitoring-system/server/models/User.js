const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_name: DataTypes.STRING,
  user_email: {
    type: DataTypes.STRING,
    unique: true,
    validate: { isEmail: true },
  },
  user_password_hash: DataTypes.TEXT,
  user_role: {
    type: DataTypes.ENUM('admin', 'doctor', 'midwife', 'nurse', 'data_clerk'),
    defaultValue: 'nurse',
  },
}, {
  hooks: {
    beforeCreate: async (user) => {
      user.user_password_hash = await bcrypt.hash(user.user_password_hash, 10);
    },
  },
});

module.exports = User;