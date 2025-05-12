const { Sequelize } = require("sequelize");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const sequelize = new Sequelize(
  isProduction ? process.env.PROD_DB_NAME : process.env.LOCAL_DB_NAME,
  isProduction ? process.env.PROD_DB_USER : process.env.LOCAL_DB_USER,
  isProduction ? process.env.PROD_DB_PASSWORD : process.env.LOCAL_DB_PASSWORD,
  {
    host: isProduction ? process.env.PROD_DB_HOST : process.env.LOCAL_DB_HOST,
    dialect: "mysql",
    logging: !isProduction, // active les logs seulement en dev
  }
);

module.exports = sequelize;
