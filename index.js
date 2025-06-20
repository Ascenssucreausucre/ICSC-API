require("dotenv").config();
const { app, server, init } = require("./src/app");

const PORT = process.env.PORT || 3000;

init()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server started on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Initialization failed:", err);
    process.exit(1);
  });
