const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "Conference",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      city: { type: DataTypes.STRING, allowNull: false },
      country: { type: DataTypes.STRING, allowNull: false },
      year: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      acronym: { type: DataTypes.STRING, allowNull: false },
      conference_index: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: "conferences", // Nom de la table en base de données
      timestamps: false,
    }
  );
};
