const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Article = sequelize.define(
    "Article",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      nr: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      affiliation: { type: DataTypes.STRING, allowNull: false },
      status: {
        type: DataTypes.ENUM("pending", "accepted", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
      profile: {
        type: DataTypes.ENUM("Invited", "Contributed"),
        allowNull: false,
        defaultValue: "Invited",
      },
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
      onUpdate: "CASCADE",
    });
  };

  return Article;
};
