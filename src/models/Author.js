const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Author = sequelize.define(
    "Author",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Author name can't be empty." },
        },
      },
      surname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Author surname can't be empty." },
        },
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Author country can't be empty." },
        },
      },
      affiliation: { type: DataTypes.STRING, allowNull: false },
      title: { type: DataTypes.STRING },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // ou false si chaque auteur doit obligatoirement être lié à un utilisateur
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "SET NULL", // ou "CASCADE" si tu veux supprimer l’auteur avec l’utilisateur
        onUpdate: "CASCADE",
      },
    },
    {
      tableName: "authors",
      timestamps: false,
    }
  );
  Author.associate = (models) => {
    Author.belongsToMany(models.Article, {
      through: models.ArticleAuthors, // Utilise le modèle ArticleAuthor pour la table de jonction
      as: "articles",
      foreignKey: "author_id",
      otherKey: "article_id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    Author.belongsToMany(models.SpecialSession, {
      through: models.SpecialSessionAuthors,
      as: "specialsessions",
      foreignKey: "author_id",
      otherKey: "special_session_id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    Author.belongsToMany(models.PlenarySession, {
      through: models.PlenarySessionAuthors,
      as: "plenarysessions",
      foreignKey: "author_id",
      otherKey: "plenary_session_id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    Author.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "userAccount",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
  };
  return Author;
};
