const ErrorLog = require("../models/errorLog");
const Log = require("../models/log");

function logMe(event, description) {
  try {
    Log.create({ event, description });
  } catch (error) {
    console.error(error);
  }
}

module.exports = logMe;
