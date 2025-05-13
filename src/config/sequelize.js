const { Sequelize } = require("sequelize");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const sequelize = isProduction
  ? new Sequelize(process.env.MYSQL_URL, {
      dialect: "mysql",
      logging: false,
    })
  : new Sequelize(
      process.env.LOCAL_DB_NAME,
      process.env.LOCAL_DB_USER,
      process.env.LOCAL_DB_PASSWORD,
      {
        host: process.env.LOCAL_DB_HOST,
        port: process.env.LOCAL_DB_PORT,
        dialect: "mysql",
        logging: true,
      }
    );

module.exports = sequelize;
