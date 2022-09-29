const sequelize = require("sequelize");
const { db } = require("../config/db");

const ApiKey = db.define("apikey", {
  key: {
    type: sequelize.STRING,
    allowNull: false,
  },
  domain: {
    type: sequelize.STRING,
    allowNull: false,
  },
  total_queries: {
    type: sequelize.INTEGER,
    defaultValue: 0,
  },
});

module.exports = ApiKey;
