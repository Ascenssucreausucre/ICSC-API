const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Topic = sequelize.define(
    "Topic",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING, allowNull: false },
      conference_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Conferences", // Correspond au nom de la table en BDD
          key: "id",
        },
      },
    },
    {
      tableName: "topics",
      timestamps: false,
    }
  );

  // Définition des relations
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
