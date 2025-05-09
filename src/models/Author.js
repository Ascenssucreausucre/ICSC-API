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

    Author.belongsToMany(models.SpecialSession, {
      through: "specialsessionauthors",
      as: "specialsessions",
      foreignKey: "author_id",
      otherKey: "special_session_id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };
  return Author;
};
