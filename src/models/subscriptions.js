const { Sequelize } = require("sequelize");
const sequelize = require("sequelize");

const { db } = require("../config/db");

const Subscription = db.define("subscription", {
  infinte: {
    type: sequelize.BOOLEAN,
    defaultValue: false,
  },
  cost: {
    type: sequelize.INTEGER,
    defaultValue: false,
  },
  start_date: {
    type: sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.fn("now"),
  },
  end_date: {
    type: sequelize.DATE,
    allowNull: false,
  },

  contract_type: {
    type: sequelize.BOOLEAN,
    allowNull: false,
  },
});

module.exports = Subscription;
