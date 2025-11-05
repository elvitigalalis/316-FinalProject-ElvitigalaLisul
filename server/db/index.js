require(dotenv).config({ path: __dirname + '/../../.env' });
let DatabaseManager;

if (process.env.DB_TYPE === "mongodb") {
    const MongoDatabaseManager = require("./mongodb");
    DatabaseManager = new MongoDatabaseManager();
} else if (process.env.DB_TYPE === "postgresql") {
    const PostgreDatabaseManager = require ("./postgresql");
    DatabaseManager = new PostgreDatabaseManager();
} else {
    throw new Error("Unsupported DB_TYPE in .env file: " + process.env.DB_TYPE);
}

DatabaseManager.connect();

module.exports = DatabaseManager;