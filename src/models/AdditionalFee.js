const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AdditionalFee = sequelize.define(
    "AdditionalFee",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      conference_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "conferences",
          key: "id",
        },
      },
      additional_paper_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          notEmpty: { msg: "Additional paper fee can't be null" },
          isDecimal: { msg: "Additional paper fee must be a valid number." },
          min: {
            args: [0],
            msg: "Additional paper fee must be a positive number.",
          },
        },
      },
      additional_page_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          notEmpty: { msg: "Additional page fee can't be null" },
          isDecimal: { msg: "Additional page fee must be a valid number." },
          min: {
            args: [0],
            msg: "Additional page fee must be a positive number.",
          },
        },
      },
      max_articles: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Max articles can't be null" },
          isInt: { msg: "Max articles must be an integer." },
          min: {
            args: [0],
            msg: "Max articles must be a positive number.",
          },
        },
      },
      given_articles_per_registration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          notEmpty: { msg: "Given articles per registration can't be null" },
          isInt: {
            msg: "Given articles per registration must be an integer.",
          },
          min: {
            args: [0],
            msg: "Given articles per registration  must be a positive number.",
          },
        },
      },
    },
    {
      tableName: "additionalfees",
      timestamps: false,
    }
  );
  AdditionalFee.associate = (models) => {
    AdditionalFee.belongsTo(models.Conference, {
      foreignKey: "conference_id",
      as: "conference",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };
  return AdditionalFee;
};
