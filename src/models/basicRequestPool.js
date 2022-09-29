const sequelize = require("sequelize");
const { db } = require("../config/db");

const RequestPool = db.define("request_pool", {
  remoteAddress: {
    type: sequelize.STRING,
    allowNull: false,
  },
  request_count: {
    type: sequelize.INTEGER,
    defaultValue: 0,
  },
});

module.exports = RequestPool;
