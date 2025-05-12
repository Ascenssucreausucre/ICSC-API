const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Workshop = sequelize.define(
    "Workshop",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: { msg: "Workshop's title can't be empty" } },
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Workshop's text/description can't be empty" },
        },
      },
      additionnal_file: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      date_from: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: { msg: "From date must be a valid date." },
        },
      },
      date_to: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: { msg: "To date must be a valid date." },
          isAfterOpening(value) {
            if (this.date_from && new Date(value) <= new Date(this.date_from)) {
              throw new Error("To date must be after from date.");
            }
          },
        },
      },
      presenters: {
        type: DataTypes.STRING, // Liste des personnes sous forme d'objet JSON
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
      tableName: "workshops",
      timestamps: false,
    }
  );

  Workshop.associate = (models) => {
    Workshop.belongsTo(models.Conference, {
      foreignKey: "conference_id",
      as: "conference",
      onDelete: "CASCADE",
    });
  };

  return Workshop;
};
