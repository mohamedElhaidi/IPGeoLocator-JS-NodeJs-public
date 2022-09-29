const sequelize = require("sequelize");

const { db } = require("../config/db");

const ErrorLog = db.define("errorlog", {
  userId: {
    type: sequelize.INTEGER,
    allowNull: true,
  },
  message: {
    type: sequelize.STRING,
    allowNull: true,
  },
  error_json: {
    type: sequelize.STRING,
    allowNull: false,
  },
});

module.exports = ErrorLog;
