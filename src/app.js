const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const sequelize = require("./config/sequelize");
const models = require("./models"); // Import des modèles

const app = express();

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("public/uploads"));

// Configuration CORS
const corsOptions = {
  origin: "http://localhost:5173", // Origine de ton frontend
  methods: ["GET", "POST", "PUT", "DELETE"], // Méthodes autorisées
  credentials: true, // Permet l'envoi de cookies
  allowedHeaders: ["Content-Type", "Authorization"], // Si nécessaire, ajoute des headers
};

app.use(cors(corsOptions)); // Applique la configuration CORS à l'application

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
const CommitteeRoutes = require("./routes/CommitteeRoutes");
app.use("/api/Committee", CommitteeRoutes);
const CommitteeMemberRoutes = require("./routes/CommitteeMemberRoutes");
app.use("/api/Committee-member", CommitteeMemberRoutes);
const AuthRoute = require("./routes/AuthRoutes");
app.use("/api/Admin-auth", AuthRoute);
const SponsorsRoutes = require("./routes/SponsorRoutes");
app.use("/api/Sponsors", SponsorsRoutes);

const FrontRoutes = require("./routes/FrontRoutes");
app.use("/api/front-routes", FrontRoutes);

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
