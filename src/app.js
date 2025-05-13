const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const sequelize = require("./config/sequelize");
const models = require("./models");

const app = express();

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("public/uploads"));

// CORS
const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Routes
app.use("/api/conferences", require("./routes/ConferenceRoutes"));
app.use("/api/importantDates", require("./routes/ImportantDatesRoutes"));
app.use("/api/topics", require("./routes/TopicsRoutes"));
app.use("/api/registration-Fees", require("./routes/RegistrationFeesRoutes"));
app.use("/api/news", require("./routes/NewsRoutes"));
app.use("/api/authors", require("./routes/AuthorsRoutes"));
app.use("/api/articles", require("./routes/ArticlesRoutes"));
app.use("/api/committee", require("./routes/CommitteeRoutes"));
app.use("/api/committee-member", require("./routes/CommitteeMemberRoutes"));
app.use("/api/admin-auth", require("./routes/AuthRoutes"));
app.use("/api/sponsors", require("./routes/SponsorRoutes"));
app.use("/api/additionnal-fee", require("./routes/AdditionnalFeeRoutes"));
app.use("/api/plenary-sessions", require("./routes/PlenarySessionRoutes"));
app.use("/api/special-sessions", require("./routes/SpecialSessionRoutes"));
app.use("/api/workshops", require("./routes/WorkshopRoutes"));
app.use("/api/local-informations", require("./routes/LocalInformationRoutes"));
app.use("/api/front-routes", require("./routes/FrontRoutes"));

// Erreur globale
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Quelque chose s'est mal passé !");
});

// ➤ Export de l'app ET d'une fonction d'initialisation
module.exports = {
  app,
  init: async () => {
    try {
      await models.sync(); // Assure la synchro DB ici
      console.log("✅ Base de données synchronisée");
    } catch (err) {
      console.error("❌ Erreur de synchronisation :", err);
      throw err;
    }
  },
};
