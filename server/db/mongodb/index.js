const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: __dirname + "/../../../.env" });
const DatabaseManager = require("../DatabaseManager");

const Playlist = require("../../models/playlist-model");
const User = require("../../models/user-model");
const Song = require("../../models/song-model");

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

  async getUsersByEmails(emails) {
    return await User.find({ email: { $in: emails } }).exec();
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

  async getUserByPlaylistId(playlistId) {
    const playlist = await Playlist.findById(playlistId).exec();
    if (playlist) {
      return await User.findOne({ email: playlist.ownerEmail }).exec();
    }
    return null;
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

  async getAllPlaylists(filters = {}) {
    console.log("Filters received:", filters);
    const { name, user, song, artist, year } = filters;
    let criteria = {};

    if (name) {
      criteria.name = { $regex: name, $options: "i" };
    }

    if (user) {
      const users = await User.find({
        username: { $regex: user, $options: "i" },
      }).exec();
      const userEmails = users.map((u) => u.email);
      criteria.ownerEmail = { $in: userEmails };
    }

    if (song || artist || year) {
      let songCriteria = {};
      if (song) songCriteria.title = { $regex: song, $options: "i" };
      if (artist) songCriteria.artist = { $regex: artist, $options: "i" };
      if (year) {
        if (!isNaN(year)) {
          songCriteria.year = Number(year);
        } else {
          songCriteria.year = { $regex: year, $options: "i" };
        }
      }
      criteria.songs = { $elemMatch: songCriteria };
    }

    return await Playlist.find(criteria).exec();
  }

  async getSongs(filters = {}) {
    const { title, artist, year } = filters;
    let criteria = {};

    if (title) criteria.title = { $regex: title, $options: "i" };
    if (artist) criteria.artist = { $regex: artist, $options: "i" };
    if (year) {
      if (!isNaN(year)) criteria.year = Number(year);
      else criteria.year = { $regex: year, $options: "i" };
    }

    return await Song.find(criteria).exec();
  }

  async createCatalogSong(data) {
    const song = new Song(data);
    return await song.save();
  }

  async updateCatalogSong(id, data) {
    return await Song.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async updateSongInPlaylists(originalYouTubeId, newData) {
    const Playlist = require("../../models/playlist-model");
    return await Playlist.updateMany(
      { "songs.youTubeId": originalYouTubeId },
      {
        $set: {
          "songs.$.title": newData.title,
          "songs.$.artist": newData.artist,
          "songs.$.year": newData.year,
          "songs.$.youTubeId": newData.youTubeId,
        },
      }
    ).exec();
  }

  // delete song from catalog collection
  async deleteCatalogSong(id) {
    const Song = require("../../models/song-model");
    return await Song.findByIdAndDelete(id).exec();
  }

  // remove song instance from all playlists based on youtube id
  async removeSongFromPlaylists(youTubeId) {
    const Playlist = require("../../models/playlist-model");
    return await Playlist.updateMany(
      { "songs.youTubeId": youTubeId },
      { $pull: { songs: { youTubeId: youTubeId } } }
    ).exec();
  }
}

module.exports = MongoDatabaseManager;
