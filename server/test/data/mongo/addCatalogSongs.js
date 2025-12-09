const dotenv = require("dotenv").config({ path: __dirname + "/../../../.env" });
const mongoose = require("mongoose");

// Import the Song model
const Song = require("../../../models/song-model");

// Import the JSON data
const songData = require("../PlaylisterDataCleaned.json");

async function clearCollection(collection, collectionName) {
  try {
    await collection.deleteMany({});
    console.log(collectionName + " cleared");
  } catch (err) {
    console.log(err);
  }
}

async function fillCollection(collection, collectionName, data) {
  try {
    await collection.insertMany(data);
    console.log(collectionName + " filled with " + data.length + " items");
  } catch (err) {
    console.error("Error filling " + collectionName + ":", err);
  }
}

async function seedSongs() {
  console.log("Seeding the Song Catalog...");

  // 1. Clear existing songs
  await clearCollection(Song, "Song");

  // 2. Fill with new data
  await fillCollection(Song, "Song", songData);

  console.log("Seeding complete!");
  process.exit();
}

// Connect and Run
mongoose
  .connect(process.env.DB_CONNECT, { useNewUrlParser: true })
  .then(() => {
    seedSongs();
  })
  .catch((e) => {
    console.error("Connection error", e.message);
    process.exit(1);
  });
