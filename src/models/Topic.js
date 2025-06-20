const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Topic = sequelize.define(
    "Topic",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Title can't be empty.",
          },
        },
      },
      conference_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "conferences",
          key: "id",
        },
      },
    },
    {
      tableName: "topics",
      timestamps: false,
    }
  );

  Topic.associate = (models) => {
    Topic.belongsTo(models.Conference, {
      foreignKey: "conference_id",
      as: "conference",
    });

    Topic.hasMany(models.Content, {
      foreignKey: "topic_id",
      as: "contents",
      onDelete: "CASCADE",
    });
  };

  return Topic;
};
