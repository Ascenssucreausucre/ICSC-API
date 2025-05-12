const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PlenarySessionAuthors = sequelize.define(
    "PlenarySessionAuthors",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      plenary_session_id: { type: DataTypes.INTEGER, allowNull: false },
      author_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    { tableName: "plenarysessionauthors" }
  );

  PlenarySessionAuthors.associate = (models) => {
    PlenarySessionAuthors.belongsTo(models.PlenarySession, {
      foreignKey: "plenary_session_id",
      as: "plenarySession",
      onDelete: "CASCADE",
    });
    PlenarySessionAuthors.belongsTo(models.Author, {
      foreignKey: "author_id",
      as: "author",
      onDelete: "CASCADE",
    });
  };

  return PlenarySessionAuthors;
};
