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

async function syncModels() {
  try {
    await models.Conference.sync(); // Conférence doit être dispo en premier

    await models.Topic.sync();
    await models.RegistrationFee.sync();
    await models.News.sync();
    await models.Article.sync();
    await models.Committee.sync();
    await models.ImportantDates.sync();
    await models.SpecialSession.sync();
    await models.Workshop.sync();
    await models.LocalInformation.sync();
    await models.PlenarySession.sync(); // maintenant elle peut utiliser conference_id
    await models.AdditionnalFee.sync();
    await models.Author.sync();
    await models.FeeCategory.sync();
    await models.CommitteeMember.sync();
    await models.CommitteeRole.sync();
    await models.Sponsor.sync();
    await models.Content.sync();
    await models.Admin.sync();
    await models.PlenarySessionAuthors.sync();
    await models.SpecialSessionAuthors.sync();
    await models.ArticleAuthors.sync();

    console.log("✅ Base de données synchronisée");
  } catch (err) {
    console.error("❌ Erreur de synchronisation :", err);
  }
}

models.sequelize = sequelize;
models.sync = syncModels;

module.exports = models;
