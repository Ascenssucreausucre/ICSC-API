const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PlenarySession = sequelize.define(
    "PlenarySession",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Plenary session's title can't be empty.",
          },
        },
      },
      author_resume: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Author resume can't be empty.",
          },
        },
      },
      affiliation: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Affiliation can't be empty.",
          },
        },
      },
      session_resume: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Plenary session's resume can't be empty.",
          },
        },
      },
      image: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
          return this.getDataValue("image");
        },
        validate: {
          notEmpty: {
            msg: "An image is required.",
          },
          notNull: {
            msg: "An image is required.",
          },
        },
      },
      conference_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "conferences", // Correspond au nom de la table en BDD
          key: "id",
        },
      },
    },
    {
      tableName: "plenarysessions",
      timestamps: false,
    }
  );

  PlenarySession.associate = (models) => {
    PlenarySession.belongsTo(models.Conference, {
      foreignKey: "conference_id",
      as: "conference",
      onDelete: "CASCADE",
    }),
      PlenarySession.belongsToMany(models.Author, {
        through: models.PlenarySessionAuthors,
        as: "authors",
        foreignKey: "plenary_session_id",
        otherKey: "author_id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
  };

  return PlenarySession;
};
