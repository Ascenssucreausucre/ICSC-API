const fs = require("fs");
const path = require("path");
const sequelize = require("../config/sequelize");

const models = {};

// Lire tous les fichiers du répertoire models
fs.readdirSync(__dirname)
  .filter((file) => file !== "index.js")
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize); // Charger et initialiser chaque modèle
    models[model.name] = model;
  });

// Définition des relations entre les modèles
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Définition manuelle des relations si besoin
models.Conference.hasMany(models.Topic, {
  foreignKey: "conference_id",
  as: "topics",
});
models.Conference.hasMany(models.RegistrationFee, {
  foreignKey: "conference_id",
  as: "registrationfees",
});
models.Conference.hasMany(models.News, {
  foreignKey: "conference_id",
  as: "news",
});
models.Conference.hasMany(models.Article, {
  foreignKey: "conference_id",
  as: "articles",
});
models.Conference.hasMany(models.Committee, {
  foreignKey: "conference_id",
  as: "committee",
});

models.Conference.hasOne(models.ImportantDates, {
  foreignKey: "conference_id",
  as: "importantDates",
});

module.exports = models;
