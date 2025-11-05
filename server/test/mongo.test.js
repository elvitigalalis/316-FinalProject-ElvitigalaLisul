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

console.log("Loaded DB_TYPE before import:", process.env.DB_TYPE);

let createdUser;
let createdPlaylist;
/**
 * Vitest test script for the Playlister app's Mongo Database Manager. Testing should verify that the Mongo Database Manager
 * will perform all necessarily operations properly.
 *
 * Scenarios we will test:
 *  1) Reading a User from the database
 *  2) Creating a User in the database
 *  3) ...
 *
 * You should add at least one test for each database interaction. In the real world of course we would do many varied
 * tests for each interaction.
 */

/**
 * Executed once before all tests are performed.
 */
beforeAll(async () => {
  // SETUP THE CONNECTION VIA MONGOOSE JUST ONCE - IT IS IMPORTANT TO NOTE THAT INSTEAD
  // OF DOING THIS HERE, IT SHOULD BE DONE INSIDE YOUR Database Manager (WHICHEVER)
  // await mongoose
  //     .connect(process.env.DB_CONNECT, { useNewUrlParser: true })
  //     .catch(e => {
  //         console.error('Connection error', e.message)
  //     })
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
afterAll(() => {});

/**
 * Vitest test to see if the Database Manager can get a User.
 */
test("Test #1) Reading a User from the Database", async () => {
  // FILL IN A USER WITH THE DATA YOU EXPECT THEM TO HAVE
  const expectedUser = {
    firstName: "Vitest",
    lastName: "Tester",
    email: `vitest_${Date.now()}@example.com`,
    passwordHash: "hash1234",
  };

  // CREATE A USER FIRST (if it doesn’t exist)
  createdUser = await db.createUser(expectedUser);

  // THIS WILL STORE THE DATA RETURNED BY A READ USER
  let actualUser = {};

  // READ THE USER
  actualUser = await db.getUserByEmail(expectedUser.email);

  // COMPARE THE VALUES OF THE EXPECTED USER TO THE ACTUAL ONE
  expect(expectedUser.firstName).toBe(actualUser.firstName);
  expect(expectedUser.lastName).toBe(actualUser.lastName);
  expect(expectedUser.email).toBe(actualUser.email);
});

/**
 * Vitest test to see if the Database Manager can create a User
 */
test("Test #2) Creating a User in the Database", async () => {
  // MAKE A TEST USER TO CREATE IN THE DATABASE
  const testUser = {
    firstName: "CreateTest",
    lastName: "User",
    email: "createtest@example.com",
    passwordHash: "hash5678",
  };

  // CREATE THE USER
  const created = await db.createUser(testUser);

  // SAVE IT TO GLOBAL
  createdUser = created;

  // NEXT TEST TO SEE IF IT WAS PROPERLY CREATED
  const expectedUser = {
    firstName: "CreateTest",
    lastName: "User",
    email: "createtest@example.com",
  };

  let actualUser = {};

  // READ THE USER
  actualUser = await db.getUserByEmail(expectedUser.email);

  // COMPARE THE VALUES OF THE EXPECTED USER TO THE ACTUAL ONE
  expect(expectedUser.firstName).toBe(actualUser.firstName);
  expect(expectedUser.lastName).toBe(actualUser.lastName);
  expect(expectedUser.email).toBe(actualUser.email);
});

// THE REST OF YOUR TEST SHOULD BE PUT BELOW

/**
 * Test #3) Updating a User in the Database
 */
test("Test #3) Updating a User in the Database", async () => {
  const updated = await db.updateUser(createdUser._id || createdUser.id, {
    firstName: "UpdatedName",
  });
  expect(updated.firstName).toBe("UpdatedName");
});

/**
 * Test #4) Getting a User by ID
 */
test("Test #4) Reading a User by ID", async () => {
  const found = await db.getUserById(createdUser._id || createdUser.id);
  expect(found).toBeTruthy();
  expect(found.email).toBe(createdUser.email);
});

/**
 * Test #5) Creating a Playlist in the Database
 */
test("Test #5) Creating a Playlist in the Database", async () => {
  const testPlaylist = {
    name: "Vitest Playlist",
    ownerEmail: createdUser.email,
    songs: [
      { title: "Song A", artist: "Tester", year: 2025, youTubeId: "abc123" },
      { title: "Song B", artist: "Tester", year: 2024, youTubeId: "xyz789" },
    ],
  };
  createdPlaylist = await db.createPlaylist(testPlaylist);
  expect(createdPlaylist).toBeTruthy();
  expect(createdPlaylist.name).toBe(testPlaylist.name);
});

/**
 * Test #6) Reading a Playlist by ID
 */
test("Test #6) Reading a Playlist by ID", async () => {
  const playlist = await db.getPlaylistById(
    createdPlaylist._id || createdPlaylist.id
  );
  expect(playlist).toBeTruthy();
  expect(playlist.name).toBe(createdPlaylist.name);
});

/**
 * Test #7) Reading Playlists by Owner Email
 */
test("Test #7) Reading Playlists by Owner Email", async () => {
  const playlists = await db.getPlaylistByOwnerEmail(createdUser.email);
  expect(Array.isArray(playlists)).toBe(true);
  expect(playlists.length).toBeGreaterThan(0);
});

/**
 * Test #8) Updating a Playlist in the Database
 */
test("Test #8) Updating a Playlist in the Database", async () => {
  const updated = await db.updatePlaylist(
    createdPlaylist._id || createdPlaylist.id,
    { name: "Updated Playlist" }
  );
  expect(updated.name).toBe("Updated Playlist");
});

/**
 * Test #9) Getting All Playlists
 */
test("Test #9) Getting All Playlists", async () => {
  const playlists = await db.getAllPlaylists();
  expect(Array.isArray(playlists)).toBe(true);
});

/**
 * Test #10) Deleting a Playlist in the Database
 */
test("Test #10) Deleting a Playlist in the Database", async () => {
  const deleted = await db.deletePlaylist(
    createdPlaylist._id || createdPlaylist.id
  );
  expect(deleted).toBeTruthy();
});
