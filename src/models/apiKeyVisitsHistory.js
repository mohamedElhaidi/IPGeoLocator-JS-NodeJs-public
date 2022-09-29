const sequelize = require("sequelize");
const { db } = require("../config/db");

const ApikeyVisit = db.define("apikey_visit", {
  user_remoteAddress: {
    type: sequelize.TEXT,
  },
  origin: {
    type: sequelize.TEXT,
  },
  query: {
    type: sequelize.TEXT,
  },
  query_continent: {
    type: sequelize.STRING,
  },
  query_country: {
    type: sequelize.STRING,
  },
  query_countryCode: {
    type: sequelize.STRING,
  },
  query_city: {
    type: sequelize.STRING,
  },
  query_regionName: {
    type: sequelize.TEXT,
  },
  query_isp: {
    type: sequelize.TEXT,
  },
  query_lat: {
    type: sequelize.INTEGER,
  },
  query_lon: {
    type: sequelize.INTEGER,
  },
  query_full_json: {
    type: sequelize.TEXT,
  },
  status: {
    type: sequelize.INTEGER,
  },
});

module.exports = ApikeyVisit;
