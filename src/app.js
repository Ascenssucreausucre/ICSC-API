const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const models = require("./models");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("public/uploads"));

// CORS
const corsOptions = {
  origin: ["http://localhost:5173", "https://icsc.up.railway.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

const io = new Server(server, {
  cors: corsOptions,
});
app.set("io", io);

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
app.use("/api/additional-fee", require("./routes/AdditionalFeeRoutes"));
app.use("/api/plenary-sessions", require("./routes/PlenarySessionRoutes"));
app.use("/api/special-sessions", require("./routes/SpecialSessionRoutes"));
app.use("/api/workshops", require("./routes/WorkshopRoutes"));
app.use("/api/local-informations", require("./routes/LocalInformationRoutes"));
app.use("/api/front-routes", require("./routes/FrontRoutes"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/user", require("./routes/UserRoutes"));
app.use("/api/", require("./routes/ConversationRoutes"));

io.on("connection", (socket) => {
  console.log("New socket connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    const roomName =
      roomId === "adminRoom" ? "adminRoom" : `conversation_${roomId}`;
    console.log(`🔗 Socket ${socket.id} joins ${roomName}`);
    socket.join(roomName);
  });

  socket.on("leaveRoom", (roomId) => {
    const roomName =
      roomId === "adminRoom" ? "adminRoom" : `conversation_${roomId}`;
    console.log(`❌ Socket ${socket.id} quits ${roomName}`);
    socket.leave(roomName);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Erreur globale
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Quelque chose s'est mal passé !");
});

// ➤ Export de l'app ET d'une fonction d'initialisation
module.exports = {
  app,
  server,
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
