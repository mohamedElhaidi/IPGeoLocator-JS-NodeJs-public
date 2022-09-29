const sequelize = require("sequelize");
const { db } = require("../config/db");

const UnauthorizedAddress = db.define("unauthorizedAddress", {
  remoteAddress: {
    type: sequelize.STRING,
    allowNull: false,
  },
});

module.exports = UnauthorizedAddress;
