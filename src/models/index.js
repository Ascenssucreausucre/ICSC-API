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
    await models.Conference.sync({ alter: true });

    await models.Topic.sync({ alter: true });
    await models.RegistrationFee.sync({ alter: true });
    await models.News.sync({ alter: true });
    await models.Article.sync({ alter: true });
    await models.Committee.sync({ alter: true });
    await models.ImportantDates.sync({ alter: true });
    await models.SpecialSession.sync({ alter: true });
    await models.Workshop.sync({ alter: true });
    await models.LocalInformation.sync({ alter: true });
    await models.PlenarySession.sync({ alter: true });
    await models.AdditionalFee.sync({ alter: true });
    await models.User.sync({ alter: true });
    await models.Author.sync({ alter: true });
    await models.FeeCategory.sync({ alter: true });
    await models.CommitteeMember.sync({ alter: true });
    await models.CommitteeRole.sync({ alter: true });
    await models.Sponsor.sync({ alter: true });
    await models.Content.sync({ alter: true });
    await models.Admin.sync({ alter: true });
    await models.PlenarySessionAuthors.sync({ alter: true });
    await models.SpecialSessionAuthors.sync({ alter: true });
    await models.ArticleAuthors.sync({ alter: true });
    await models.PushSubscription.sync({ alter: true });

    console.log("✅ Base de données synchronisée");
  } catch (err) {
    console.error("❌ Erreur de synchronisation :", err);
  }
}

models.sequelize = sequelize;
models.sync = syncModels;

module.exports = models;
