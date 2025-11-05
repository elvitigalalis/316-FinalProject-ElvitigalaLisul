const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: __dirname + "/../../../.env" });

class MongoDatabaseManager {
  async connect() {
    try {
      await mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true });
      console.log("Connected to MongoDB");
    } catch (e) {
      console.error("Connection error (MongoDB)", e.message);
    }
  }

  getConnection() {
    return mongoose.connection;
  }
}

module.exports = MongoDatabaseManager;