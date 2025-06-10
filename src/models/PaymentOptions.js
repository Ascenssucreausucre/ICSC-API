const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PaymentOption = sequelize.define(
    "PaymentOption",
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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      description: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "payment_options",
      timestamps: false,
    }
  );
  PaymentOption.associate = (models) => {
    PaymentOption.belongsTo(models.Conference, {
      foreignKey: "conference_id",
      as: "conference",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };
  return PaymentOption;
};
