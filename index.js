require("dotenv").config();
const { app, init } = require("./src/app");

const PORT = process.env.PORT || 3000;

init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Échec du démarrage :", err);
    process.exit(1);
  });
