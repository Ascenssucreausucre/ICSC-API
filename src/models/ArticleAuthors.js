const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ArticleAuthors = sequelize.define(
    "ArticleAuthors",
    {
      article_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "articles",
          key: "id",
        },
        primaryKey: true,
      },
      author_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "authors",
          key: "id",
        },
        primaryKey: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "articleauthors",
      timestamps: false,
    }
  );

  return ArticleAuthors;
};
