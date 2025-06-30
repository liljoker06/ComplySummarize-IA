module.exports = (sequelize, DataTypes) => {
  const Summary = sequelize.define("Summary", {
    summaryText: DataTypes.TEXT,
    keyPoints: DataTypes.TEXT,
    actionItems: DataTypes.TEXT
  });
  Summary.associate = (models) => {
    Summary.belongsTo(models.Document, { foreignKey: 'documentId' });
  };
  return Summary;
};
