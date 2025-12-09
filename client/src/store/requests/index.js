/*
    This is our http api, which we use to send requests to
    our back-end API. Note we`re using the Axios library
    for doing this, which is an easy to use AJAX-based
    library. We could (and maybe should) use Fetch, which
    is a native (to browsers) standard, but Axios is easier
    to use when sending JSON back and forth and it`s a Promise-
    based API which helps a lot with asynchronous communication.
    
    @author McKilla Gorilla
    @author elvitigalalis
*/

const baseURL = "http://localhost:4000/store";

async function request(path, method = "GET", body = null) {
  const url = baseURL + path;
  try {
    const options = {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    };
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error("Request failed with status " + response.status);
    }

    const data = await response.json().catch(() => ({}));
    return {
      status: response.status,
      data: data,
    };
  } catch (e) {
    return { status: 500, data: { success: false, error: e.message } };
  }
}

// THESE ARE ALL THE REQUESTS WE`LL BE MAKING, ALL REQUESTS HAVE A
// REQUEST METHOD (like get) AND PATH (like /top5list). SOME ALSO
// REQUIRE AN id SO THAT THE SERVER KNOWS ON WHICH LIST TO DO ITS
// WORK, AND SOME REQUIRE DATA, WHICH WE WE WILL FORMAT HERE, FOR WHEN
// WE NEED TO PUT THINGS INTO THE DATABASE OR IF WE HAVE SOME
// CUSTOM FILTERS FOR QUERIES
export const createPlaylist = (newListName, newSongs, userEmail) => {
  return request(`/playlist/`, "POST", {
    // SPECIFY THE PAYLOAD
    name: newListName,
    songs: newSongs,
    ownerEmail: userEmail,
  });
};
export const deletePlaylistById = (id) => request(`/playlist/${id}`, "DELETE");
export const getPlaylistById = (id) => request(`/playlist/${id}`, "GET");
export const getPlaylistPairs = () => request(`/playlistpairs/`, "GET");
export const updatePlaylistById = (id, playlist) => {
  return request(`/playlist/${id}`, "PUT", {
    // SPECIFY THE PAYLOAD
    playlist: playlist,
  });
};
export const getUserByEmail = (email) => request(`/user/${email}`, "GET");
export const getUserByPlaylistId = (id) =>
  request(`/user/byplaylist/${id}`, "GET");
export const filterPlaylists = (filters) => {
  console.log("sent filters:", filters);
  const query = new URLSearchParams(filters).toString();
  return request(`/playlists?${query}`, "GET");
};
export const getSongs = () => request(`/songs`, "GET");
export const searchSongs = (filters) => {
  const query = new URLSearchParams(filters).toString();
  return request(`/songs?${query}`, "GET");
};
export const createCatalogSong = (songData) =>
  request(`/songs`, "POST", songData);

export const updateCatalogSong = (id, songData) =>
  request(`/songs/${id}`, "PUT", songData);

export const deleteCatalogSong = (id) => request(`/songs/${id}`, "DELETE");
export const updateSongStats = (id, action) =>
  request(`/songs/${id}/stats`, "PUT", { action });

const apis = {
  createPlaylist,
  deletePlaylistById,
  getPlaylistById,
  getPlaylistPairs,
  updatePlaylistById,
  getUserByEmail,
  getUserByPlaylistId,
  filterPlaylists,
  getSongs,
  searchSongs,
  createCatalogSong,
  updateCatalogSong,
  deleteCatalogSong,
  updateSongStats,
};

export default apis;
