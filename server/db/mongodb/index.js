const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: __dirname + "/../../../.env" });
const { DatabaseManager } = require("../index");

const Playlist = require("../../models/playlist-model");
const User = require("../../models/user-model");

class MongoDatabaseManager extends DatabaseManager {
  async connect() {
    try {
      await mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true });
      console.log("Connected to MongoDB database");
    } catch (e) {
      console.error("Connection error (MongoDB)", e.message);
    }
  }

  getConnection() {
    return mongoose.connection;
  }

  async createUser(data) {
    const user = new User(data);
    return await user.save();
  }

  async getUserByEmail(email) {
    return await User.findOne({ email }).exec();
  }

  async getUserById(id) {
    return await User.findById(id).exec();
  }

  async updateUser(id, data) {
    return await User.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async createPlaylist(data) {
    const playlist = new Playlist(data);
    return await playlist.save();
  }

  async getPlaylistById(id) {
    return await Playlist.findById(id).exec();
  }

  async getPlaylistByOwnerEmail(email) {
    return await Playlist.find({ ownerEmail: email }).exec();
  }

  async updatePlaylist(id, data) {
    return await Playlist.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deletePlaylist(id) {
    const playlist = await Playlist.findByIdAndDelete(id).exec();
    if (playlist && playlist.ownerEmail) {
      const user = await User.findOne({ email: playlist.ownerEmail }).exec();
      if (user) {
        user.playlists = user.playlists.filter(
          (pID) => pID.toString() !== id.toString()
        );
        await user.save();
      }
    }
    return playlist;
  }

  async getAllPlaylists() {
    return await Playlist.find({}).exec();
  }
}

module.exports = MongoDatabaseManager;
