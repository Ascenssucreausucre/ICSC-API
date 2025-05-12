const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SpecialSession = sequelize.define(
    "SpecialSession",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Special session's title can't be empty.",
          },
        },
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Special session's summary can't be empty.",
          },
        },
      },
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
      tableName: "specialsessions",
      timestamps: false,
    }
  );

  SpecialSession.associate = (models) => {
    SpecialSession.belongsTo(models.Conference, {
      foreignKey: "conference_id",
      as: "conference",
      onDelete: "CASCADE",
    });

    // Relation many-to-many avec Author (via une table intermédiaire)
    SpecialSession.belongsToMany(models.Author, {
      through: "specialsessionauthors",
      as: "authors",
      foreignKey: "special_session_id",
      otherKey: "author_id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return SpecialSession;
};
