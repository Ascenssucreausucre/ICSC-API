// config/config.js
require("dotenv").config();

console.log(process.env.DB_USER); // Vérifie si la variable est bien chargée

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mysql",
  },
  test: {
    // Optionnel : même structure pour test
  },
  production: {
    // Optionnel : même structure pour production
  },
};
