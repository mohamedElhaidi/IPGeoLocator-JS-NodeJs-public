const sequelize = require("sequelize");

const { db } = require("../config/db");

const Plan = db.define("plan", {
  isFree: {
    type: sequelize.BOOLEAN,
    defaultValue: false,
  },

  title: {
    type: sequelize.STRING,
    allowNull: false,
  },
  stripe_plan_id: {
    type: sequelize.STRING,
    allowNull: true,
  },
  stripe_plan_price_id: {
    type: sequelize.STRING,
    allowNull: true,
  },
  description: {
    type: sequelize.STRING,
    allowNull: true,
  },
  price: {
    type: sequelize.INTEGER,
    defaultValue: 0,
  },
  discount: {
    type: sequelize.INTEGER,
    defaultValue: 0,
  },
});

module.exports = Plan;
