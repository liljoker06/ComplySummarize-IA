module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define("Document", {
    filename: DataTypes.STRING,
    originalName: DataTypes.STRING,
    mimeType: DataTypes.STRING
  });
  Document.associate = (models) => {
    Document.hasOne(models.Summary, { foreignKey: 'documentId' });
  };
  return Document;
};
