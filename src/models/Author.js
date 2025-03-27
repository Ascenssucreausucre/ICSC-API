const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Author = sequelize.define(
    "Author",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      surname: { type: DataTypes.STRING, allowNull: false },
      country: { type: DataTypes.TEXT, allowNull: false },
    },
    {
      tableName: "authors",
      timestamps: false,
    }
  );
  Author.associate = (models) => {
    Author.belongsToMany(models.Article, {
      through: "articleauthors",
      as: "articles",
      foreignKey: "author_id",
      otherKey: "article_id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };
  return Author;
};
