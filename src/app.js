const express = require("express");
const cors = require("cors");
require("dotenv").config();
const sequelize = require("./config/sequelize");
const models = require("./models"); // Import des modèles

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const ConferencesRoutes = require("./routes/ConferenceRoutes");
app.use("/api/Conferences", ConferencesRoutes);
const ImportantDatesRoutes = require("./routes/ImportantDatesRoutes");
app.use("/api/ImportantDates", ImportantDatesRoutes);
const TopicsRoutes = require("./routes/TopicsRoutes");
app.use("/api/Topics", TopicsRoutes);
const RegistrationFeesRoutes = require("./routes/RegistrationFeesRoutes");
app.use("/api/Registration-Fees", RegistrationFeesRoutes);
const NewsRoutes = require("./routes/NewsRoutes");
app.use("/api/News", NewsRoutes);
const AuthorsRoutes = require("./routes/AuthorsRoutes");
app.use("/api/Authors", AuthorsRoutes);
const ArticlesRoutes = require("./routes/ArticlesRoutes");
app.use("/api/Articles", ArticlesRoutes);

// Synchronisation avec la base de données
sequelize
  .sync({ alter: true })
  .then(() => console.log("Base de données synchronisée."))
  .catch((err) => console.error("Erreur de synchronisation :", err));

// Gestion des erreurs globale
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Quelque chose s'est mal passé !");
});

module.exports = app;
