const sequelize = require("sequelize");

const { db } = require("../config/db");

const PlanFeature = db.define("plan_feature", {});

module.exports = PlanFeature;
