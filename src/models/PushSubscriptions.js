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
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "users",
          key: "id",
        },
      },
    },
    {
      tableName: "push_subscriptions",
      timestamps: true,
    }
  );

  PushSubscription.associate = (models) => {
    PushSubscription.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return PushSubscription;
};
