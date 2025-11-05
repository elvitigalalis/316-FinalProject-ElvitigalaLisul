const { Sequelize, DataTypes, Model } = require("sequelize");
const { deletePlaylist } = require("../../controllers/store-controller");

class PostgreDatabaseManager {
  constructor() {
    this.sequelize = new Sequelize(
      process.env.PG_DB_NAME,
      process.env.PG_USER,
      process.env.PG_PASSWORD,
      {
        host: process.env.PG_HOST,
        port: process.env.PG_PORT,
        dialect: "postgres",
        logging: false,
      }
    );
  }

  async connect() {
    try {
      await this.sequelize.authenticate();
      console.log("Connected to PostgreSQL database");
    } catch (e) {
      console.error("Connection error (PostgreSQL)", e.message);
    }
  }

  getConnection() {
    return this.sequelize;
  }

  defineModels() {
    class User extends Sequelize.Model {}
    User.init(
      {
        firstName: { type: DataTypes.STRING, allowNull: false },
        lastName: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        passwordHash: { type: DataTypes.STRING, allowNull: false },
      },
      { sequelize: this.sequelize, modelName: "User" }
    );

    class Playlist extends Sequelize.Model {}
    Playlist.init(
      {
        name: { type: DataTypes.STRING, allowNull: false },
        ownerEmail: { type: DataTypes.STRING, allowNull: false },
        songs: { type: DataTypes.JSONB, allowNull: false },
      },
      { sequelize: this.sequelize, modelName: "Playlist" }
    );

    User.hasMany(Playlist, {
      foreignKey: "ownerEmail",
      sourceKey: "email",
      onDelete: "CASCADE",
    });
    Playlist.belongsTo(User, { foreignKey: "ownerEmail", targetKey: "email" });
  }

  async createUser(data) {
    return await this.User.create(data);
  }

  async getUserByEmail(email) {
    return await this.User.findOne({ where: { email } });
  }

  async getUserById(id) {
    return await this.User.findByPk(id);
  }

  async updateUser(id, data) {
    const user = await this.User.findByPk(id);
    if (!user) return null;
    return await user.update(data);
  }

  async createPlaylist(data) {
    if (data.ownerEmail) {
      const owner = await this.User.findOne({
        where: { email: data.ownerEmail },
      });
      if (!owner)
        throw new Error(
          "Owner with email " + data.ownerEmail + " does not exist."
        );
    }
    return await this.Playlist.create(data);
  }

  async getPlaylistById(id) {
    return await this.Playlist.findByPk(id);
  }

  async getPlaylistByOwnerEmail(ownerEmail) {
    return await this.Playlist.findAll({ where: { ownerEmail } });
  }

  async updatePlaylist(id, data) {
    const playlist = await this.Playlist.findByPk(id);
    if (!playlist) return null;
    return await playlist.update(data);
  }

  async deletePlaylist(id) {
    const playlist = await this.Playlist.findByPk(id);
    if (!playlist) return null;
    await playlist.destroy();
    return playlist;
  }

  async getAllPlaylists() {
    return await this.Playlist.findAll();
  }
}

module.exports = PostgreDatabaseManager;
