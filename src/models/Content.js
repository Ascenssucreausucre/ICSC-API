const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Content = sequelize.define(
    "Content",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      text: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Subtopic can't be empty.",
          },
        },
      },
      topic_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "topics",
          key: "id",
        },
      },
    },
    {
      tableName: "contents",
      timestamps: false,
    }
  );

  Content.associate = (models) => {
    Content.belongsTo(models.Topic, {
      foreignKey: "topic_id",
      as: "topic",
      onDelete: "CASCADE",
    });
  };

  return Content;
};
