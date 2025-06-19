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
    await sequelize.sync();
    console.log("✅ Database has been usccessfully synchronized!");
  } catch (err) {
    console.error("❌ Error while synchronizing tables :", err);
  }
}

models.sequelize = sequelize;
models.sync = syncModels;

module.exports = models;
