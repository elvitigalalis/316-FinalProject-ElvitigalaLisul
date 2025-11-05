require("dotenv").config({ path: __dirname + "/../../.env" });

let DatabaseSelector;
// const dbType = (process.env.DB_TYPE || "mongodb").toLowerCase();
const dbType = process.env.DB_TYPE.toLowerCase();
console.log("Database type: " + dbType);
if (dbType === "mongodb") {
  const MongoDatabaseManager = require("./mongodb");
  DatabaseSelector = new MongoDatabaseManager();
} else if (dbType === "postgresql") {
  const PostgreDatabaseManager = require("./postgresql");
  DatabaseSelector = new PostgreDatabaseManager();
} else {
  throw new Error("Unsupported DB_TYPE in .env file: " + process.env.DB_TYPE);
}

DatabaseSelector.connect();
module.exports = DatabaseSelector;
