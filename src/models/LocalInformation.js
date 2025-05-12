const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const LocalInformation = sequelize.define(
    "LocalInformation",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Local information's title can't be empty",
          },
        },
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Local information's text can't be empty",
          },
        },
      },
      file: {
        type: DataTypes.STRING, // Nom ou chemin du fichier
        allowNull: true,
      },
      conference_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Conferences", // Correspond au nom de la table en BDD
          key: "id",
        },
      },
    },
    {
      tableName: "localinformations",
      timestamps: false,
    }
  );

  LocalInformation.associate = (models) => {
    LocalInformation.belongsTo(models.Conference, {
      foreignKey: "conference_id",
      as: "conference",
      onDelete: "CASCADE",
    });
  };

  return LocalInformation;
};
