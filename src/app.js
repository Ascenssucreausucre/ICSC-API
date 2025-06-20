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

app.post(
  "/api/stripe-webhook",
  express.raw({ type: "application/json" }),
  require("./utils/StripeWebhook")
);

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("public/uploads"));

let corsOrigin = [];

if (process.env.CORS_ORIGIN) {
  corsOrigin = process.env.CORS_ORIGIN.split(",");
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

// Global error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong");
});

// Exports the app + initializing function
module.exports = {
  app,
  server,
  init: async () => {
    try {
      await models.sync();
      console.log("✅ Database synchronized");
    } catch (err) {
      console.error("❌ Synchronization error :", err);
      throw err;
    }
  },
};
