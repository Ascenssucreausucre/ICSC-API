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
          model: "Topics", // Le nom de la table à laquelle la clé fait référence
          key: "id",
        },
      },
    },
    {
      tableName: "Contents",
      timestamps: false,
    }
  );

  // Définir la relation entre Topic et Content (un sujet a plusieurs éléments de contenu)
  Content.associate = (models) => {
    Content.belongsTo(models.Topic, {
      foreignKey: "topic_id",
      as: "topic",
      onDelete: "CASCADE",
    });
  };

  return Content;
};
