const sequelize = require("sequelize");

const bcrypt = require("bcryptjs");

const { db } = require("../config/db");

const User = db.define("user", {
  isAdmin: {
    type: sequelize.BOOLEAN,
    defaultValue: false,
  },
  account_status: {
    type: sequelize.BOOLEAN,
    defaultValue: true,
  },
  email: {
    type: sequelize.STRING,
    allowNull: false,
  },
  first_name: {
    type: sequelize.STRING,
    allowNull: false,
  },
  last_name: {
    type: sequelize.STRING,
    allowNull: false,
  },
  company: {
    type: sequelize.STRING,
    allowNull: true,
  },
  address1: {
    type: sequelize.STRING,
    allowNull: false,
  },
  address2: {
    type: sequelize.STRING,
    allowNull: true,
  },
  code_postal: {
    type: sequelize.INTEGER,
    allowNull: true,
  },
  phone: {
    type: sequelize.STRING,
    allowNull: true,
  },
  verification_code: {
    type: sequelize.STRING,
    allowNull: true,
  },
  verified: {
    type: sequelize.BOOLEAN,
    defaultValue: false,
  },
  password: {
    type: sequelize.STRING,
    allowNull: false,
    set(value) {
      // hash password from here
      const encrypted = bcrypt.hashSync(value, 12);
      this.setDataValue("password", encrypted);
    },
  },
});

module.exports = User;
