const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PushSubscription = sequelize.define(
    "PushSubscription",
    {
      endpoint: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      expirationTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      p256dh: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      auth: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "push_subscriptions",
      timestamps: true,
    }
  );

  return PushSubscription;
};
