const sequelize = require("sequelize");

const { db } = require("../config/db");

const Feature = db.define("feature", {
  title: {
    type: sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Feature;
