const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Birth = sequelize.define('Birth', {
    birth_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    birth_mother_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    birth_mother_age: {
      type: DataTypes.INTEGER,
      validate: {
        min: 10,
        max: 60
      }
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isBefore: new Date().toISOString()
      }
    },
    birth_gender: {
      type: DataTypes.ENUM('Male', 'Female', 'Intersex'),
      allowNull: false
    },
    birth_weight: {
      type: DataTypes.DECIMAL(4,2),
      validate: {
        min: 0.1,
        max: 10
      }
    },
    birth_outcome: {
      type: DataTypes.ENUM('live_birth', 'stillbirth', 'neonatal_death'),
      defaultValue: 'live_birth'
    }
    // Add all other fields from your schema
  }, {
    tableName: 'births',
    timestamps: true,
    createdAt: 'birth_created_at',
    updatedAt: 'birth_updated_at'
  });

  Birth.associate = (models) => {
    Birth.hasMany(models.MaternalHealth, {
      foreignKey: 'record_birth_id',
      as: 'maternalHealth'
    });
    Birth.hasMany(models.BirthComplication, {
      foreignKey: 'complication_birth_id',
      as: 'complications'
    });
    Birth.belongsTo(models.User, {
      foreignKey: 'birth_registered_by',
      as: 'registeredBy'
    });
  };

  return Birth;
};