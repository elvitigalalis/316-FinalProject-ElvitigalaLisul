const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SongSchema = new Schema(
  {
    title: { type: String, required: true },
    artist: { type: String, required: true },
    year: { type: Number, required: true },
    youTubeId: { type: String, required: true },
    ownerEmail: { type: String, required: true },
    listens: { type: Number, default: 0 },
    playlistCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Song", SongSchema);