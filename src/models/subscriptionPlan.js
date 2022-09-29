const sequelize = require("sequelize");

const { db } = require("../config/db");

const SubscriptionPlan = db.define("subscription_plan", {});

module.exports = SubscriptionPlan;
