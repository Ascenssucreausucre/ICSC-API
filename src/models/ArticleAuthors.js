const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ArticleAuthors = sequelize.define(
    "ArticleAuthors",
    {
      article_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "articles", // Nom de la table `Articles`
          key: "id",
        },
        primaryKey: true,
      },
      author_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "authors", // Nom de la table `Authors`
          key: "id",
        },
        primaryKey: true,
      },
      // Ajoute ici d'autres champs si nécessaire
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "articleauthors", // Le nom de la table de jonction
      timestamps: false, // Si tu ne veux pas que Sequelize ajoute des timestamps comme `createdAt` et `updatedAt`
    }
  );

  return ArticleAuthors;
};
