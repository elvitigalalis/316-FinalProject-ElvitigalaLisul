require("dotenv").config({ path: __dirname + "/../../../.env" });
const { Sequelize, DataTypes, Model } = require("sequelize");

async function resetPostgre() {
  const testData = require("../example-db-data.json");

  const sequelize = new Sequelize(
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

  class User extends Model {}
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      firstName: { type: DataTypes.STRING, allowNull: false },
      lastName: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      passwordHash: { type: DataTypes.STRING, allowNull: false },
    },
    { sequelize, modelName: "User" }
  );

  class Playlist extends Model {}
  Playlist.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING, allowNull: false },
      ownerEmail: { type: DataTypes.STRING, allowNull: false },
      songs: { type: DataTypes.JSONB, allowNull: false },
    },
    { sequelize, modelName: "Playlist" }
  );

  User.hasMany(Playlist, { foreignKey: "ownerEmail", sourceKey: "email" });
  Playlist.belongsTo(User, { foreignKey: "ownerEmail", targetKey: "email" });

  await sequelize.sync({ force: true });

  // DESTROYS ALL EXISTING DATA FOR USERS AND PLAYLISTS
  console.log("Resetting the Postgre DB");
  await User.destroy({ where: {} });
  console.log("User cleared");
  await Playlist.destroy({ where: {} });
  console.log("Playlist cleared");

  // FILLS USERS FIRST TO CREATE FOREIGN KEY RELATIONSHIPS
  for (const user of testData.users) {
    await User.create(user);
  }
  console.log("User filled");

  for (const playlist of testData.playlists) {
    await Playlist.create(playlist);
  }
  console.log("Playlist filled");

  await sequelize.close();
}

resetPostgre().catch((e) =>
  console.error("Can't connect to database: ", e.message)
);
