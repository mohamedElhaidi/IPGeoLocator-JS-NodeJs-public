const sequelize = require("sequelize");

const { db } = require("../config/db");

const Log = db.define("log", {
  event: {
    type: sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: sequelize.STRING,
    allowNull: true,
  },
});

module.exports = Log;
