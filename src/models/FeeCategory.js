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
      type: { type: DataTypes.STRING, allowNull: false },
      ieee_member: { type: DataTypes.DECIMAL, allowNull: false },
      non_ieee_member: { type: DataTypes.DECIMAL, allowNull: false },
      virtual_attendance: { type: DataTypes.DECIMAL, allowNull: false },
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
