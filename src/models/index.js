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

models.Conference.hasMany(models.SpecialSession, {
  foreignKey: "conference_id",
  as: "specialSessions",
});

models.Conference.hasMany(models.Workshop, {
  foreignKey: "conference_id",
  as: "workshops",
});

models.Conference.hasMany(models.LocalInformation, {
  foreignKey: "conference_id",
  as: "localInfomations",
});
models.Conference.hasMany(models.PlenarySession, {
  foreignKey: "conference_id",
  as: "plenarySessions",
});
models.Conference.hasOne(models.AdditionnalFee, {
  foreignKey: "conference_id",
  as: "additionnalfees",
});

async function syncModels() {
  try {
    await models.Conference.sync();
    await Promise.all([
      models.Author.sync(),
      models.PlenarySession.sync(),
      models.Article.sync(),
      models.SpecialSession.sync(),
      models.Topic.sync(),
      models.Content.sync(),
      models.RegistrationFee.sync(),
      models.FeeCategory.sync(),
      models.Committee.sync(),
      models.CommitteeMember.sync(),
      models.CommitteeRoles.sync(),
      models.LocalInformation.sync(),
      models.News.sync(),
      models.ImportantDates.sync(),
      models.AdditionnalFee.sync(),
      models.Workshop.sync(),
      models.Sponsor.sync(),
    ]);
    console.log("✅ Base de données synchronisée");
  } catch (err) {
    console.error("❌ Erreur de synchronisation :", err);
  }
}

models.sequelize = sequelize;
models.sync = syncModels;

module.exports = models;
