const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Article = sequelize.define(
    "Article",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      nr: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        validate: { notEmpty: { msg: "Nr can't be empty" } },
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Title can't be empty.",
          },
        },
      },
      status: {
        type: DataTypes.ENUM("pending", "accepted", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
      profile: {
        type: DataTypes.ENUM("Invited", "Contributed"),
        allowNull: false,
        defaultValue: "Contributed",
      },
      registration_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "registrations",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
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
      tableName: "articles",
      timestamps: false,
    }
  );

  Article.associate = (models) => {
    Article.belongsToMany(models.Author, {
      through: models.ArticleAuthors,
      as: "authors",
      foreignKey: "article_id",
      otherKey: "author_id",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    Article.belongsTo(models.Registration, {
      foreignKey: "registration_id",
      as: "registration",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    Article.belongsTo(models.Conference, {
      foreignKey: "conference_id",
      as: "conference",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return Article;
};
