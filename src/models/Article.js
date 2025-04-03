const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Article = sequelize.define(
    "Article",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING, allowNull: false },
      affiliation: { type: DataTypes.STRING, allowNull: false },
      accepted: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
      conference_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Conferences",
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
      through: "articleauthors",
      as: "authors",
      foreignKey: "article_id",
      otherKey: "author_id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
    Article.belongsTo(models.Conference, {
      foreignKey: "conference_id",
      as: "conference",
      onDelete: "CASCADE",
    });
  };

  return Article;
};
