const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AdditionnalFee = sequelize.define(
    "AdditionnalFee",
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
      additionnal_paper_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          notEmpty: { msg: "Additionnal paper fee can't be null" },
          isDecimal: { msg: "Additionnal paper fee must be a valid number." },
          min: {
            args: [0],
            msg: "Additionnal paper fee must be a positive number.",
          },
        },
      },
      additionnal_page_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          notEmpty: { msg: "Additionnal page fee can't be null" },
          isDecimal: { msg: "Additionnal page fee must be a valid number." },
          min: {
            args: [0],
            msg: "Additionnal page fee must be a positive number.",
          },
        },
      },
    },
    {
      tableName: "additionnalfees",
      timestamps: false,
    }
  );
  AdditionnalFee.associate = (models) => {
    AdditionnalFee.belongsTo(models.Conference, {
      foreignKey: "conference_id",
      as: "conference",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };
  return AdditionnalFee;
};
