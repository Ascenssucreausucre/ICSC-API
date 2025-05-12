const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const FeeCategory = sequelize.define(
    "FeeCategory",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      registration_fee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "registrationfees",
          key: "id",
        },
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Fee category's type cannot be empty." },
        },
      },
      ieee_member: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          notEmpty: { msg: "IEEE Member's fee can't be null" },
          isDecimal: { msg: "IEEE Member's fee must be a valid number." },
          min: {
            args: [0],
            msg: "IEEE Member's fee must be a positive number.",
          },
        },
      },
      non_ieee_member: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          notEmpty: { msg: "Non-IEEE Member's fee can't be null" },
          isDecimal: { msg: "Non-IEEE Member's fee must be a valid number." },
          min: {
            args: [0],
            msg: "Non-IEEE Member's fee must be a positive number.",
          },
        },
      },
      virtual_attendance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          isDecimal: {
            msg: "Virtual attendance fee must be a valid number.",
          },
          min: {
            args: [0],
            msg: "Virtual attendance fee must be a positive number.",
          },
        },
      },
    },
    {
      tableName: "feecategories",
      timestamps: false,
    }
  );
  FeeCategory.associate = (models) => {
    FeeCategory.belongsTo(models.RegistrationFee, {
      foreignKey: "registration_fee_id",
      as: "registrationfee",
      onDelete: "CASCADE",
    });
  };
  return FeeCategory;
};
