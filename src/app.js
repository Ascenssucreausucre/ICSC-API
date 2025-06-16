const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const models = require("./models");
const { Server } = require("socket.io");
const { secureThrottling } = require("./middleware/secureThrottling");

const app = express();
const server = http.createServer(app);

// Middlewares
app.use(cookieParser());
app.use((req, res, next) => {
  if (req.originalUrl === "/api/stripe-webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("public/uploads"));

const corsOrigin = [
  "https://icsc.up.railway.app",
  "https://icsc-conference.netlify.app",
];

if (process.env.NODE_ENV === "development") {
  corsOrigin.push("http://localhost:5173");
}

// CORS
const corsOptions = {
  origin: corsOrigin,
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
app.use("/api/", secureThrottling, require("./routes"));

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
