require("dotenv").config({ path: __dirname + "/../../.env" });

let DatabaseSelector;

const MongoDatabaseManager = require("./mongodb");
DatabaseSelector = new MongoDatabaseManager();

DatabaseSelector.connect();
module.exports = DatabaseSelector;
