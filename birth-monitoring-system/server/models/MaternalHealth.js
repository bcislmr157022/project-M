module.exports = (sequelize) => {
  return sequelize.define('MaternalHealth', {
    record_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    previous_pregnancies: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    anc_visits: DataTypes.INTEGER,
    hiv_status: {
      type: DataTypes.ENUM('positive', 'negative', 'unknown', 'declined')
    }
    // Add other fields from your schema
  }, {
    tableName: 'maternal_health_records'
  });
};