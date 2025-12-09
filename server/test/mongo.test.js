import {
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
  expect,
  test,
} from "vitest";
let db;
import dotenv from "dotenv";
dotenv.config({ path: __dirname + "/../.env" });

let createdUser;
let createdPlaylist;
let createdSong;

/**
 * Vitest test script for the Playlister app's Mongo Database Manager. Testing should verify that the Mongo Database Manager
 * will perform all necessarily operations properly.
 *
 * Scenarios we will test:
 * 1) Creating a User in the database
 * 2) Reading a User from the database (By Email)
 * 3) Reading a User from the database (By ID)
 * 4) Updating a User in the database
 * 5) Creating a Song in the Catalog
 * 6) Reading Songs from the Catalog (Search)
 * 7) Updating Song Stats (Listens/Playlist Count)
 * 8) Updating Song Data in the Catalog
 * 9) Creating a Playlist in the database
 * 10) Reading a Playlist by ID
 * 11) Reading Playlists by Owner Email
 * 12) Updating a Playlist (Name and Songs)
 * 13) Getting All Playlists (with Filtering)
 * 14) Deleting a Playlist
 * 15) Deleting a Song from Catalog (and Cascade check)
 *
 * You should add at least one test for each database interaction. In the real world of course we would do many varied
 * tests for each interaction.
 */

/**
 * Executed once before all tests are performed.
 */
beforeAll(async () => {
  // SETUP THE CONNECTION VIA MONGOOSE JUST ONCE
  db = (await import("../db/index.js")).default;
  if (db.connect) await db.connect();
});

/**
 * Executed before each test is performed.
 */
beforeEach(() => {});

/**
 * Executed after each test is performed.
 */
afterEach(() => {});

/**
 * Executed once after all tests are performed.
 */
afterAll(async () => {
  // CLEANUP
  if (createdUser) {
    // Assuming a deleteUser function exists or manual cleanup if needed,
    // mostly relies on test DB teardown in real env.
  }
});

/**
 * Vitest test to see if the Database Manager can create a User
 */
test("Test #1) Creating a User in the Database", async () => {
  const testUser = {
    username: "VitestUser",
    email: `vitest_${Date.now()}@example.com`,
    passwordHash: "hash1234",
    profilePicture: "data:image/png;base64,testimage",
  };

  const created = await db.createUser(testUser);
  createdUser = created;

  expect(created).toBeTruthy();
  expect(created.email).toBe(testUser.email);
  expect(created.username).toBe(testUser.username);
});

/**
 * Vitest test to see if the Database Manager can get a User by Email.
 */
test("Test #2) Reading a User from the Database (By Email)", async () => {
  const foundUser = await db.getUserByEmail(createdUser.email);

  expect(foundUser).toBeTruthy();
  expect(foundUser._id.toString()).toBe(createdUser._id.toString());
  expect(foundUser.username).toBe(createdUser.username);
});

/**
 * Vitest test to see if the Database Manager can get a User by ID.
 */
test("Test #3) Reading a User from the Database (By ID)", async () => {
  const foundUser = await db.getUserById(createdUser._id);

  expect(foundUser).toBeTruthy();
  expect(foundUser.email).toBe(createdUser.email);
});

/**
 * Vitest test to see if the Database Manager can update a User.
 */
test("Test #4) Updating a User in the Database", async () => {
  const updated = await db.updateUser(createdUser._id, {
    username: "UpdatedVitestUser",
  });

  // Re-fetch to confirm persistence
  const foundUser = await db.getUserById(createdUser._id);

  expect(foundUser.username).toBe("UpdatedVitestUser");
  createdUser = foundUser; // Update reference
});

/**
 * Vitest test to see if the Database Manager can create a Catalog Song.
 */
test("Test #5) Creating a Song in the Catalog", async () => {
  const newSong = {
    title: "Vitest Song",
    artist: "The Testers",
    year: 2024,
    youTubeId: "dQw4w9WgXcQ",
    ownerEmail: createdUser.email,
  };

  const created = await db.createCatalogSong(newSong);
  createdSong = created;

  expect(created).toBeTruthy();
  expect(created.title).toBe(newSong.title);
  expect(created.listens).toBe(0);
});

/**
 * Vitest test to see if the Database Manager can search/read Songs.
 */
test("Test #6) Reading Songs from the Catalog", async () => {
  // Test search by title
  const songs = await db.getSongs({ title: "Vitest" });

  expect(Array.isArray(songs)).toBe(true);
  expect(songs.length).toBeGreaterThan(0);
  expect(songs[0].title).toBe("Vitest Song");
});

/**
 * Vitest test to see if the Database Manager can update Song Stats.
 */
test("Test #7) Updating Song Stats (Listens/Playlist Count)", async () => {
  // Increment listen count
  const updatedListen = await db.incrementSongListenCount(createdSong._id);
  expect(updatedListen.listens).toBe(1);

  // Increment playlist count
  const updatedPlaylistCount = await db.updateSongPlaylistCount(
    createdSong._id,
    1
  );
  expect(updatedPlaylistCount.playlistCount).toBe(1);
});

/**
 * Vitest test to see if the Database Manager can update Song Metadata.
 */
test("Test #8) Updating Song Data in the Catalog", async () => {
  const updated = await db.updateCatalogSong(createdSong._id, {
    title: "Vitest Song Revised",
  });

  expect(updated.title).toBe("Vitest Song Revised");
  createdSong = updated; // Update reference
});

/**
 * Vitest test to see if the Database Manager can create a Playlist.
 */
test("Test #9) Creating a Playlist in the Database", async () => {
  const testPlaylist = {
    name: "Vitest Playlist",
    ownerEmail: createdUser.email,
    songs: [
      {
        title: createdSong.title,
        artist: createdSong.artist,
        year: createdSong.year,
        youTubeId: createdSong.youTubeId,
      },
    ],
  };

  createdPlaylist = await db.createPlaylist(testPlaylist);
  expect(createdPlaylist).toBeTruthy();
  expect(createdPlaylist.name).toBe(testPlaylist.name);
  expect(createdPlaylist.songs.length).toBe(1);
});

/**
 * Vitest test to see if the Database Manager can get a Playlist by ID.
 */
test("Test #10) Reading a Playlist by ID", async () => {
  const playlist = await db.getPlaylistById(createdPlaylist._id);
  expect(playlist).toBeTruthy();
  expect(playlist.ownerEmail).toBe(createdUser.email);
});

/**
 * Vitest test to see if the Database Manager can get Playlists by Owner Email.
 */
test("Test #11) Reading Playlists by Owner Email", async () => {
  const playlists = await db.getPlaylistByOwnerEmail(createdUser.email);
  expect(Array.isArray(playlists)).toBe(true);
  expect(playlists.length).toBeGreaterThan(0);
  expect(playlists[0].name).toBe("Vitest Playlist");
});

/**
 * Vitest test to see if the Database Manager can update a Playlist.
 */
test("Test #12) Updating a Playlist (Name and Songs)", async () => {
  // Add a second song and change name
  const newSongs = [
    ...createdPlaylist.songs,
    {
      title: "Second Song",
      artist: "Tester",
      year: 2025,
      youTubeId: "xyz789",
    },
  ];

  const updated = await db.updatePlaylist(createdPlaylist._id, {
    name: "Updated Vitest Playlist",
    songs: newSongs,
  });

  expect(updated.name).toBe("Updated Vitest Playlist");
  expect(updated.songs.length).toBe(2);
  createdPlaylist = updated;
});

/**
 * Vitest test to see if the Database Manager can search/filter all playlists.
 */
test("Test #13) Getting All Playlists (with Filtering)", async () => {
  // Filter by name
  const playlists = await db.getAllPlaylists({ name: "Updated Vitest" });

  expect(Array.isArray(playlists)).toBe(true);
  expect(playlists.length).toBeGreaterThan(0);
  expect(playlists[0].name).toContain("Updated Vitest");
});

/**
 * Vitest test to see if the Database Manager can delete a Playlist.
 */
test("Test #14) Deleting a Playlist in the Database", async () => {
  await db.deletePlaylist(createdPlaylist._id);

  const found = await db.getPlaylistById(createdPlaylist._id);
  expect(found).toBeNull();
});

/**
 * Vitest test to see if the Database Manager can delete a Song and cascade updates.
 */
test("Test #15) Deleting a Song from Catalog", async () => {
  // Create a temp playlist that uses the song first to test cascade (conceptually)
  // But here we just test the delete function

  await db.deleteCatalogSong(createdSong._id);

  // Verify deletion
  const songs = await db.getSongs({ title: "Vitest Song Revised" });
  // Should verify it's gone (implementation depends on getSongs return for empty)
  const exists = songs.some(
    (s) => s._id.toString() === createdSong._id.toString()
  );
  expect(exists).toBe(false);
});
