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
app.use("/api/conferences", ConferencesRoutes);
const ImportantDatesRoutes = require("./routes/ImportantDatesRoutes");
app.use("/api/importantDates", ImportantDatesRoutes);
const TopicsRoutes = require("./routes/TopicsRoutes");
app.use("/api/topics", TopicsRoutes);
const RegistrationFeesRoutes = require("./routes/RegistrationFeesRoutes");
app.use("/api/registration-Fees", RegistrationFeesRoutes);
const NewsRoutes = require("./routes/NewsRoutes");
app.use("/api/news", NewsRoutes);
const AuthorsRoutes = require("./routes/AuthorsRoutes");
app.use("/api/authors", AuthorsRoutes);
const ArticlesRoutes = require("./routes/ArticlesRoutes");
app.use("/api/articles", ArticlesRoutes);
const CommitteeRoutes = require("./routes/CommitteeRoutes");
app.use("/api/committee", CommitteeRoutes);
const CommitteeMemberRoutes = require("./routes/CommitteeMemberRoutes");
app.use("/api/committee-member", CommitteeMemberRoutes);
const AuthRoute = require("./routes/AuthRoutes");
app.use("/api/admin-auth", AuthRoute);
const SponsorsRoutes = require("./routes/SponsorRoutes");
app.use("/api/sponsors", SponsorsRoutes);
const AdditionnalFeeRoutes = require("./routes/AdditionnalFeeRoutes");
app.use("/api/additionnal-fee", AdditionnalFeeRoutes);
const PlenarySessionRoutes = require("./routes/PlenarySessionRoutes");
app.use("/api/plenary-sessions", PlenarySessionRoutes);
const SpecialSessionRoutes = require("./routes/SpecialSessionRoutes");
app.use("/api/special-sessions", SpecialSessionRoutes);
const WorkshopRoutes = require("./routes/WorkshopRoutes");
app.use("/api/workshops", WorkshopRoutes);
const LocalInformationRoutes = require("./routes/LocalInformationRoutes");
app.use("/api/local-informations", LocalInformationRoutes);

const FrontRoutes = require("./routes/FrontRoutes");
app.use("/api/front-routes", FrontRoutes);

// Synchronisation avec la base de données
async function startServer() {
  await models.sync(); // ✅ Attend bien que Sequelize ait fini
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("❌ Erreur au démarrage :", err);
});

// Gestion des erreurs globale
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Quelque chose s'est mal passé !");
});

module.exports = app;
