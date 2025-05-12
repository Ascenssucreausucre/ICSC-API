const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Sponsor = sequelize.define(
    "Sponsor",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: { msg: "Sponsor's name can't be empty." } },
      },
      image: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
          return this.getDataValue("image");
        },
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: { msg: "Sponsor's type can't be empty." } },
      },
      conference_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Conferences",
          key: "id",
        },
      },
    },
    {
      tableName: "sponsors",
      timestamps: false,
    }
  );

  Sponsor.associate = (models) => {
    // Association avec Conference
    Sponsor.belongsTo(models.Conference, {
      foreignKey: "conference_id",
      as: "conference",
      onDelete: "CASCADE",
    });
  };

  return Sponsor;
};
