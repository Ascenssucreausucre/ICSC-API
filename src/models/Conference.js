const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "Conference",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      city: { type: DataTypes.STRING, allowNull: false },
      country: { type: DataTypes.STRING, allowNull: false },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            msg: "Year must be integer.",
          },
          min: {
            args: [2000],
            msg: "Year can't be smaller than 2000.",
          },
        },
      },
      title: { type: DataTypes.STRING, allowNull: false },
      acronym: { type: DataTypes.STRING, allowNull: false },
      conference_index: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            msg: "Conference Index must be integer.",
          },
          min: {
            args: [0],
            msg: "Conference Index can't be negative.",
          },
        },
      },
      current: { type: DataTypes.TINYINT, defaultValue: 0 },
      banner: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
          return this.getDataValue("banner");
        },
      },
      primary_color: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "#eb4c4c",
      },
      secondary_color: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "#502f2f",
      },
      tertiary_color: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "#4736a8",
      },
    },
    {
      tableName: "conferences", // Nom de la table en base de données
      timestamps: false,
    }
  );
};
