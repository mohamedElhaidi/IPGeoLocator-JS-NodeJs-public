const { db } = require("../config/db");
const sequelize = require("sequelize");
const { generateString } = require("../utils/random");
const Ticket = db.define("ticket", {
  title: {
    type: sequelize.TEXT,
    allowNull: false,
  },
  message: {
    type: sequelize.TEXT,
    allowNull: false,
  },
  email: {
    type: sequelize.STRING,
    allowNull: false,
  },
  full_name: {
    type: sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Ticket;
