const Sequelize = require("sequelize");

const init = function () {
  const db = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USER,
    process.env.DATABASE_PASSWORD,
    {
      host: process.env.DATABASE_HOST,
      dialect: "mysql",
    }
  );

  return db;
};

const testConnection = async function (db) {
  try {
    await db.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    LogError(null, error);
  }
};
module.exports = { db: init(), testConnection };
