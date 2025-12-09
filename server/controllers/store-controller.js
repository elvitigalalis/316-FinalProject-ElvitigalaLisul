const db = require("../db");
const auth = require("../auth");
/*
    This is our back-end API. It provides all the data services
    our database needs. Note that this file contains the controller
    functions for each endpoint.
    
    @author McKilla Gorilla
    @author elvitigalalis
*/
createPlaylist = async (req, res) => {
  if (auth.verifyUser(req) === null) {
    return res.status(400).json({
      errorMessage: "UNAUTHORIZED",
    });
  }
  const body = req.body;
  console.log("createPlaylist body: " + JSON.stringify(body));
  if (!body) {
    return res.status(400).json({
      success: false,
      error: "You must provide a Playlist",
    });
  }

  try {
    const user = await db.getUserById(req.userId);
    if (!user) {
      return res.status(400).json({
        errorMessage: "User not found",
      });
    }
    const playlist = await db.createPlaylist({
      name: body.name,
      ownerEmail: user.email,
      songs: body.songs,
    });
    await db.updateUser(req.userId, {
      playlists: [...(user.playlists || []), playlist._id || playlist.id],
    });
    return res.status(201).json({
      playlist: playlist,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      errorMessage: "Playlist Not Created!",
    });
  }
};
deletePlaylist = async (req, res) => {
  if (auth.verifyUser(req) === null) {
    return res.status(400).json({
      errorMessage: "UNAUTHORIZED",
    });
  }
  console.log("delete Playlist with id: " + JSON.stringify(req.params.id));
  console.log("delete " + req.params.id);
  try {
    const playlist = await db.getPlaylistById(req.params.id);
    console.log("playlist found: " + JSON.stringify(playlist));
    if (!playlist) {
      return res.status(404).json({
        errorMessage: "Playlist not found",
      });
    }

    const user = await db.getUserByEmail(playlist.ownerEmail);
    console.log("user._id: " + user._id);
    console.log("req.userId: " + req.userId);

    if (user._id == req.userId || user.id == req.userId) {
      console.log("correct user!");
      await db.deletePlaylist(req.params.id);
      return res.status(200).json({
        success: true,
        id: req.params.id,
        message: "Playlist deleted!",
      });
    } else {
      console.log("incorrect user!");
      return res
        .status(400)
        .json({ success: false, errorMessage: "authentication error" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      errorMessage: "server error, playlist not deleted",
    });
  }
};

getPlaylistById = async (req, res) => {
  // if (auth.verifyUser(req) === null) {
  //   return res.status(400).json({
  //     errorMessage: "UNAUTHORIZED",
  //   });
  // }
  console.log("Find Playlist with id: " + JSON.stringify(req.params.id));

  try {
    const list = await db.getPlaylistById(req.params.id);
    if (!list) {
      return res
        .status(404)
        .json({ success: false, error: "Playlist not found" });
    }
    console.log("Found list: " + JSON.stringify(list));

    // const user = await db.getUserByEmail(list.ownerEmail);
    // console.log("user._id: " + user._id);
    // console.log("req.userId: " + req.userId);

    // if (user._id == req.userId || user.id == req.userId) {
    //   console.log("correct user!");
      return res.status(200).json({ success: true, playlist: list });
    // } else {
    //   console.log("incorrect user!");
    //   return res
    //     .status(400)
    //     .json({ success: false, description: "authentication error" });
    // }
  } catch (err) {
    console.error(err);
    return res.status(400).json({ success: false, error: err });
  }
};
getPlaylistPairs = async (req, res) => {
  //   console.log("getPlaylistPairs endpoint HIT");
  // if (auth.verifyUser(req) === null) {
  //   return res.status(400).json({
  //     errorMessage: "UNAUTHORIZED",
  //   });
  // }
  console.log("getPlaylistPairs");
  try {
    const user = await db.getUserById(req.userId);
    console.log("find user with id " + req.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const playlists = await db.getPlaylistByOwnerEmail(user.email);
    console.log("found Playlists: " + JSON.stringify(playlists));
    if (!playlists) {
      console.log("!playlists.length");
      return res
        .status(404)
        .json({ success: false, error: "Playlists not found" });
    } else {
      console.log("Send the Playlist pairs");
      let pairs = [];
      for (let key in playlists) {
        let list = playlists[key];
        let pair = {
          _id: list._id || list.id,
          name: list.name,
          username: user.username,
          listeners: list.listenerCount || 0,
        };
        pairs.push(pair);
      }
      return res.status(200).json({ success: true, idNamePairs: pairs });
    }
  } catch (err) {
    console.error(err);
    return res.status(400).json({ success: false, error: err });
  }
};

getPlaylists = async (req, res) => {
  // if (auth.verifyUser(req) === null) {
  //   return res.status(400).json({
  //     errorMessage: "UNAUTHORIZED",
  //   });
  // }
  console.log("getplaylists called");
  console.log("getPlaylists with filters: " + JSON.stringify(req.query));

  try {
    const playlists = await db.getAllPlaylists(req.query);
    console.log("found Playlists: " + JSON.stringify(playlists));

    // no results = success
    if (!playlists.length) {
      return res.status(200).json({ success: true, idNamePairs: [] });
    }

    const ownerEmails = [...new Set(playlists.map((p) => p.ownerEmail))];
    const owners = await db.getUsersByEmails(ownerEmails);
    const emailToUsername = {};
    owners.forEach((u) => {
      emailToUsername[u.email] = u.username;
    });

    const idNamePairs = playlists.map((playlist) => {
      return {
        _id: playlist._id,
        name: playlist.name,
        ownerEmail: playlist.ownerEmail,
        username: emailToUsername[playlist.ownerEmail] || "Unknown",
        listeners: playlist.listenerCount || 0,
        songs: playlist.songs,
      };
    });

    return res.status(200).json({ success: true, idNamePairs: idNamePairs });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ success: false, error: err });
  }
};

updatePlaylist = async (req, res) => {
  // if (auth.verifyUser(req) === null) {
  //   return res.status(400).json({
  //     errorMessage: "UNAUTHORIZED",
  //   });
  // }
  const body = req.body;
  console.log("updatePlaylist: " + JSON.stringify(body));
  console.log("req.body.name: " + req.body.name);

  if (!body) {
    return res.status(400).json({
      success: false,
      error: "You must provide a body to update",
    });
  }

  try {
    const playlist = await db.getPlaylistById(req.params.id);
    console.log("playlist found: " + JSON.stringify(playlist));
    if (!playlist) {
      return res.status(404).json({
        message: "Playlist not found!",
      });
    }

    const user = await db.getUserByEmail(playlist.ownerEmail);
    console.log("user._id: " + user._id);
    console.log("req.userId: " + req.userId);

    // if (user._id == req.userId || user.id == req.userId) {
      console.log("correct user!");
      console.log("req.body.name: " + req.body.name);

      await db.updatePlaylist(req.params.id, body.playlist);
      console.log("SUCCESS!!!");
      return res.status(200).json({
        success: true,
        id: req.params.id,
        message: "Playlist updated!",
      });
    // } else {
      // console.log("incorrect user!");
      // return res
        // .status(400)
        // .json({ success: false, description: "authentication error" });
    // }
  } catch (error) {
    console.log("FAILURE: " + JSON.stringify(error));
    return res.status(404).json({
      error,
      message: "Playlist not updated!",
    });
  }
};

getUserByEmail = async (req, res) => {
  try {
    const email = req.params.email;
    const user = await db.getUserByEmail(email);
    console.log("db user1234: ", user);
    if (!user) {
      return res.status(404).json({
        errorMessage: "User not found",
      });
    }

    console.log("user found: " + JSON.stringify(user));
    return res.status(200).json({
      success: true,
      user: {
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      errorMessage: err,
    });
  }
};

getUserByPlaylistId = async (req, res) => {
  try {
    const playlistId = req.params.id;
    const user = await db.getUserByPlaylistId(playlistId);

    if (!user) {
      return res.status(404).json({
        errorMessage: "User not found for the given playlist ID",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      errorMessage: err,
    });
  }
};

module.exports = {
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getPlaylistPairs,
  getPlaylists,
  updatePlaylist,
  getUserByEmail,
  getUserByPlaylistId,
};