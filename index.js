require("dotenv").config();
const { app, server, init } = require("./src/app");

const PORT = process.env.PORT || 3000;

init()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Échec du démarrage :", err);
    process.exit(1);
  });
