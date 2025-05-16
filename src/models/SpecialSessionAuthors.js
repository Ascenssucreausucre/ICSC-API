const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SpecialSessionAuthors = sequelize.define(
    "SpecialSessionAuthors",
    {
      special_session_id: { type: DataTypes.INTEGER, allowNull: false },
      author_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    { tableName: "specialsessionauthors", timestamps: false }
  );

  SpecialSessionAuthors.associate = (models) => {
    SpecialSessionAuthors.belongsTo(models.SpecialSession, {
      foreignKey: "special_session_id",
      as: "specialsession",
      onDelete: "CASCADE",
    });
    SpecialSessionAuthors.belongsTo(models.Author, {
      foreignKey: "author_id",
      as: "authors",
      onDelete: "CASCADE",
    });
  };

  return SpecialSessionAuthors;
};
