// config/config.js
require("dotenv").config();

module.exports = {
  development: {
    username: process.env.LOCAL_DB_USER,
    password: process.env.LOCAL_DB_PASSWORD,
    database: process.env.LOCAL_DB_NAME,
    host: process.env.LOCAL_DB_HOST,
    dialect: "mysql",
  },
  test: {
    // Optionnel : même structure pour test
  },
  production: {
    // Optionnel : même structure pour production
  },
};
