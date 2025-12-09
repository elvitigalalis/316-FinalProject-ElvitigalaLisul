import { createContext, useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import { jsTPS } from "jstps";
import storeRequestSender from "./requests";
import CreateSong_Transaction from "../transactions/CreateSong_Transaction";
import MoveSong_Transaction from "../transactions/MoveSong_Transaction";
import RemoveSong_Transaction from "../transactions/RemoveSong_Transaction";
import UpdateSong_Transaction from "../transactions/UpdateSong_Transaction";
import AuthContext from "../auth";

/*
    This is our global data store. Note that it uses the Flux design pattern,
    which makes use of things like actions and reducers. 
    
    @author McKilla Gorilla
    @author elvitigalalis
*/

// THIS IS THE CONTEXT WE'LL USE TO SHARE OUR STORE
export const GlobalStoreContext = createContext({});
console.log("create GlobalStoreContext");

// THESE ARE ALL THE TYPES OF UPDATES TO OUR GLOBAL
// DATA STORE STATE THAT CAN BE PROCESSED
export const GlobalStoreActionType = {
  CHANGE_LIST_NAME: "CHANGE_LIST_NAME",
  CLOSE_CURRENT_LIST: "CLOSE_CURRENT_LIST",
  CREATE_NEW_LIST: "CREATE_NEW_LIST",
  LOAD_ID_NAME_PAIRS: "LOAD_ID_NAME_PAIRS",
  MARK_LIST_FOR_DELETION: "MARK_LIST_FOR_DELETION",
  SET_CURRENT_LIST: "SET_CURRENT_LIST",
  SET_LIST_NAME_EDIT_ACTIVE: "SET_LIST_NAME_EDIT_ACTIVE",
  EDIT_SONG: "EDIT_SONG",
  REMOVE_SONG: "REMOVE_SONG",
  HIDE_MODALS: "HIDE_MODALS",
  PLAY_PLAYLIST: "PLAY_PLAYLIST",
  EDIT_PLAYLIST: "EDIT_PLAYLIST",
  LOAD_SONG_CATALOG: "LOAD_SONG_CATALOG",
  CREATE_CATALOG_SONG: "CREATE_CATALOG_SONG",
  UPDATE_CATALOG_SONG: "UPDATE_CATALOG_SONG",
  MARK_SONG_FOR_REMOVAL: "MARK_SONG_FOR_REMOVAL",
};

// WE'LL NEED THIS TO PROCESS TRANSACTIONS
const tps = new jsTPS();

const CurrentModal = {
  NONE: "NONE",
  DELETE_LIST: "DELETE_LIST",
  EDIT_SONG: "EDIT_SONG",
  REMOVE_SONG: "REMOVE_SONG",
  ERROR: "ERROR",
  PLAY_PLAYLIST: "PLAY_PLAYLIST",
  EDIT_PLAYLIST: "EDIT_PLAYLIST",
  LOAD_SONG_CATALOG: "LOAD_SONG_CATALOG",
};

// WITH THIS WE'RE MAKING OUR GLOBAL DATA STORE
// AVAILABLE TO THE REST OF THE APPLICATION
function GlobalStoreContextProvider(props) {
  const [store, setStore] = useState({
    currentModal: CurrentModal.NONE,
    idNamePairs: [],
    currentList: null,
    currentSongIndex: -1,
    currentSong: null,
    newListCounter: 0,
    listNameActive: false,
    listIdMarkedForDeletion: null,
    listMarkedForDeletion: null,
    songCatalog: [],
    currentFilters: null,
    currentSort: "Listeners (Hi-Lo)",
    songMarkedForRemoval: null,
  });
  const history = useHistory();

  console.log("inside useGlobalStore");

  // SINCE WE'VE WRAPPED THE STORE IN THE AUTH CONTEXT WE CAN ACCESS THE USER HERE
  const { auth } = useContext(AuthContext);

  // HERE'S THE DATA STORE'S REDUCER, IT MUST
  // HANDLE EVERY TYPE OF STATE CHANGE
  const storeReducer = (action) => {
    const { type, payload } = action;
    switch (type) {
      case GlobalStoreActionType.CHANGE_LIST_NAME: {
        return setStore({
          ...store,
          currentModal: CurrentModal.NONE,
          idNamePairs: payload.idNamePairs,
          currentList: payload.playlist,
          listNameActive: false,
        });
      }
      case GlobalStoreActionType.CLOSE_CURRENT_LIST: {
        return setStore({
          ...store,
          currentModal: CurrentModal.NONE,
          currentList: null,
          currentSongIndex: -1,
          currentSong: null,
        });
      }
      case GlobalStoreActionType.CREATE_NEW_LIST: {
        return setStore({
          ...store,
          currentModal: CurrentModal.NONE,
          currentList: payload,
          currentSongIndex: -1,
          currentSong: null,
          newListCounter: store.newListCounter + 1,
        });
      }
      case GlobalStoreActionType.LOAD_ID_NAME_PAIRS: {
        return setStore({
          ...store,
          currentModal: CurrentModal.NONE,
          idNamePairs: payload.pairs,
          currentFilters:
            payload.filters !== undefined
              ? payload.filters
              : store.currentFilters,
          currentSort:
            payload.sort !== undefined ? payload.sort : store.currentSort,
        });
      }
      case GlobalStoreActionType.MARK_LIST_FOR_DELETION: {
        return setStore({
          ...store,
          currentModal: CurrentModal.DELETE_LIST,
          listIdMarkedForDeletion: payload.id,
          listMarkedForDeletion: payload.playlist,
        });
      }
      case GlobalStoreActionType.SET_CURRENT_LIST: {
        return setStore({
          ...store,
          currentModal:
            store.currentModal === CurrentModal.EDIT_PLAYLIST
              ? CurrentModal.EDIT_PLAYLIST
              : CurrentModal.NONE,
          currentList: payload,
          currentSongIndex: -1,
          currentSong: null,
        });
      }
      case GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE: {
        return setStore({
          ...store,
          currentModal: CurrentModal.NONE,
          listNameActive: true,
        });
      }
      case GlobalStoreActionType.EDIT_SONG: {
        return setStore({
          ...store,
          currentModal: CurrentModal.EDIT_SONG,
          currentSongIndex: payload.currentSongIndex,
          currentSong: payload.currentSong,
        });
      }
      case GlobalStoreActionType.REMOVE_SONG: {
        return setStore({
          ...store,
          currentModal:
            store.currentModal === CurrentModal.EDIT_PLAYLIST
              ? CurrentModal.EDIT_PLAYLIST
              : CurrentModal.NONE,
          currentSongIndex: payload.currentSongIndex,
          currentSong: payload.currentSong,
        });
      }
      case GlobalStoreActionType.PLAY_PLAYLIST: {
        return setStore({
          ...store,
          currentModal: CurrentModal.PLAY_PLAYLIST,
          currentList: payload,
        });
      }
      case GlobalStoreActionType.EDIT_PLAYLIST: {
        return setStore({
          ...store,
          currentModal: CurrentModal.EDIT_PLAYLIST,
          currentList: payload,
        });
      }
      case GlobalStoreActionType.HIDE_MODALS: {
        return setStore({
          ...store,
          currentModal: CurrentModal.NONE,
          songMarkedForRemoval: null,
        });
      }
      case GlobalStoreActionType.LOAD_SONG_CATALOG: {
        return setStore((prev) => ({
          ...prev,
          songCatalog: payload,
        }));
      }
      case GlobalStoreActionType.MARK_SONG_FOR_REMOVAL: {
        return setStore({
          ...store,
          currentModal: CurrentModal.REMOVE_SONG,
          songMarkedForRemoval: payload,
        });
      }
      default:
        return store;
    }
  };

  store.tryAcessingOtherAccountPlaylist = function () {
    let id = "635f203d2e072037af2e6284";
    async function asyncSetCurrentList(id) {
      let response = await storeRequestSender.getPlaylistById(id);
      if (response.data.success) {
        let playlist = response.data.playlist;
        storeReducer({
          type: GlobalStoreActionType.SET_CURRENT_LIST,
          payload: playlist,
        });
      }
    }
    asyncSetCurrentList(id);
    history.push("/playlist/635f203d2e072037af2e6284");
  };

  // THESE ARE THE FUNCTIONS THAT WILL UPDATE OUR STORE AND
  // DRIVE THE STATE OF THE APPLICATION. WE'LL CALL THESE IN
  // RESPONSE TO EVENTS INSIDE OUR COMPONENTS.

  // THIS FUNCTION PROCESSES CHANGING A LIST NAME
  store.changeListName = function (id, newName) {
    // GET THE LIST
    async function asyncChangeListName(id) {
      let response = await storeRequestSender.getPlaylistById(id);
      if (response.data.success) {
        let playlist = response.data.playlist;
        playlist.name = newName;
        async function updateList(playlist) {
          response = await storeRequestSender.updatePlaylistById(
            playlist.id || playlist._id,
            playlist
          );
          if (response.data.success) {
            async function getListPairs(playlist) {
              response = await storeRequestSender.getPlaylistPairs();
              if (response.data.success) {
                let pairsArray = response.data.idNamePairs;
                storeReducer({
                  type: GlobalStoreActionType.CHANGE_LIST_NAME,
                  payload: {
                    idNamePairs: pairsArray,
                    playlist: playlist,
                  },
                });
                // HIGHLIGHTED FIX: Removed store.setCurrentList(id)
                // We already updated the reducer above with the new name.
                // Calling setCurrentList triggers a new fetch and SET_CURRENT_LIST action,
                // which might reset the modal state to NONE or cause flicker.
              }
            }
            getListPairs(playlist);
          }
        }
        updateList(playlist);
      }
    }
    asyncChangeListName(id);
  };

  store.closeCurrentList = function () {
    storeReducer({
      type: GlobalStoreActionType.CLOSE_CURRENT_LIST,
      payload: {},
    });
    tps.clearAllTransactions();
    history.push("/");
  };

  // THIS FUNCTION CREATES A NEW LIST
  store.createNewList = async function () {
    let newListName = "Untitled" + store.newListCounter;
    const response = await storeRequestSender.createPlaylist(
      newListName,
      [],
      auth.user.email
    );
    if (response.status === 201) {
      tps.clearAllTransactions();
      let newList = response.data.playlist;
      storeReducer({
        type: GlobalStoreActionType.CREATE_NEW_LIST,
        payload: newList,
      });

      // IF IT'S A VALID LIST THEN LET'S START EDITING IT
      history.push("/playlist/" + newList._id);
    }
  };

  // THIS FUNCTION LOADS ALL THE ID, NAME PAIRS SO WE CAN LIST ALL THE LISTS
  store.loadIdNamePairs = function () {
    async function asyncLoadIdNamePairs() {
      let response;
      let filtersToUse = store.currentFilters;

      if (filtersToUse) {
        response = await storeRequestSender.filterPlaylists(filtersToUse);
      } else {
        response = await storeRequestSender.getPlaylistPairs();
      }

      if (response.data.success) {
        let pairs = response.data.idNamePairs;
        let sortedPairs = [...pairs];
        const sortType = store.currentSort;

        switch (sortType) {
          case "Name (A-Z)":
            sortedPairs.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case "Name (Z-A)":
            sortedPairs.sort((a, b) => b.name.localeCompare(a.name));
            break;
          case "User (A-Z)":
            sortedPairs.sort((a, b) =>
              (a.username || "").localeCompare(b.username || "")
            );
            break;
          case "User (Z-A)":
            sortedPairs.sort((a, b) =>
              (b.username || "").localeCompare(a.username || "")
            );
            break;
          case "Listeners (Hi-Lo)":
            sortedPairs.sort((a, b) => (b.listeners || 0) - (a.listeners || 0));
            break;
          case "Listeners (Lo-Hi)":
            sortedPairs.sort((a, b) => (a.listeners || 0) - (b.listeners || 0));
            break;
          default:
            break;
        }

        storeReducer({
          type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
          payload: {
            pairs: sortedPairs,
            filters: filtersToUse,
            sort: store.currentSort,
          },
        });
      }
    }
    asyncLoadIdNamePairs();
  };

  store.duplicatePlaylist = async function (id) {
    async function asyncDuplicatePlaylist(id) {
      let response = await storeRequestSender.getPlaylistById(id);
      if (response.data.success) {
        let playlist = response.data.playlist;
        let newListName = playlist.name + " (Copy)";
        response = await storeRequestSender.createPlaylist(
          newListName,
          playlist.songs,
          auth.user.email
        );
        if (response.status === 201) {
          store.loadIdNamePairs();
        }
      }
    }
    asyncDuplicatePlaylist(id);
  };

  store.loadSongCatalog = async function () {
    const response = await storeRequestSender.getSongs();
    if (response.data.success) {
      storeReducer({
        type: GlobalStoreActionType.LOAD_SONG_CATALOG,
        payload: response.data.songs,
      });
    }
  };

  store.searchSongs = async function (filters) {
    const response = await storeRequestSender.searchSongs(filters);
    if (response.data.success) {
      storeReducer({
        type: GlobalStoreActionType.LOAD_SONG_CATALOG,
        payload: response.data.songs,
      });
    }
  };

  store.addSongToPlaylist = async function (playlistId, songData) {
    let response = await storeRequestSender.getPlaylistById(playlistId);
    if (response.data.success) {
      let playlist = response.data.playlist;
      let newSong = {
        title: songData.title,
        artist: songData.artist,
        year: songData.year,
        youTubeId: songData.youTubeId,
      };
      playlist.songs.push(newSong);
      await storeRequestSender.updatePlaylistById(playlistId, playlist);
    }
  };

  store.createCatalogSong = async function (songData) {
    const response = await storeRequestSender.createCatalogSong(songData);
    if (response.status === 201) {
      store.loadSongCatalog();
      store.hideModals();
    }
  };

  store.updateCatalogSong = async function (id, songData, oldYouTubeId) {
    let payload = {
      ...songData,
      originalYouTubeId: oldYouTubeId,
    };
    const response = await storeRequestSender.updateCatalogSong(id, payload);
    if (response.status === 200) {
      store.loadSongCatalog();
      store.hideModals();
    }
  };

  store.markSongForRemoval = function (song) {
    storeReducer({
      type: GlobalStoreActionType.MARK_SONG_FOR_REMOVAL,
      payload: song,
    });
  };

  store.removeCatalogSong = async function () {
    let id = store.songMarkedForRemoval._id;
    const response = await storeRequestSender.deleteCatalogSong(id);
    if (response.status === 200) {
      store.loadSongCatalog();
      storeReducer({
        type: GlobalStoreActionType.MARK_SONG_FOR_REMOVAL,
        payload: null,
      });
      store.hideModals();
    }
  };

  store.playPlaylist = function (id) {
    async function asyncPlayPlaylist(id) {
      let response = await storeRequestSender.getPlaylistById(id);
      if (response.data.success) {
        let playlist = response.data.playlist;
        if (!playlist.listenerIds) {
          playlist.listenerIds = [];
        }
        if (auth.user) {
          let userId = auth.user.id;
          if (!playlist.listenerIds.includes(userId)) {
            playlist.listenerIds.push(userId);
            playlist.listenerCount = playlist.listenerIds.length;
            await storeRequestSender.updatePlaylistById(playlist._id, playlist);
          }
        }
        storeReducer({
          type: GlobalStoreActionType.PLAY_PLAYLIST,
          payload: playlist,
        });
      }
    }
    asyncPlayPlaylist(id);
  };

  store.editPlaylist = function (id) {
    async function asyncEditPlaylist(id) {
      let response = await storeRequestSender.getPlaylistById(id);
      if (response.data.success) {
        let playlist = response.data.playlist;
        storeReducer({
          type: GlobalStoreActionType.EDIT_PLAYLIST,
          payload: playlist,
        });
      }
    }
    asyncEditPlaylist(id);
  };

  store.sortPlaylists = function (sortType) {
    if (!store.idNamePairs) return;
    let sortedList = [...store.idNamePairs];
    switch (sortType) {
      case "Name (A-Z)":
        sortedList.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Name (Z-A)":
        sortedList.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "User (A-Z)":
        sortedList.sort((a, b) =>
          (a.username || "").localeCompare(b.username || "")
        );
        break;
      case "User (Z-A)":
        sortedList.sort((a, b) =>
          (b.username || "").localeCompare(a.username || "")
        );
        break;
      case "Listeners (Hi-Lo)":
        sortedList.sort((a, b) => (b.listeners || 0) - (a.listeners || 0));
        break;
      case "Listeners (Lo-Hi)":
        sortedList.sort((a, b) => (a.listeners || 0) - (b.listeners || 0));
        break;
      default:
        break;
    }
    storeReducer({
      type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
      payload: {
        pairs: sortedList,
        filters: store.currentFilters,
        sort: sortType,
      },
    });
  };

  store.filterPlaylists = async function (filters) {
    const isEmpty = Object.values(filters).every((x) => x === null || x === "");
    if (isEmpty) {
      async function resetToMyLists() {
        const response = await storeRequestSender.getPlaylistPairs();
        if (response.data.success) {
          let pairs = response.data.idNamePairs;
          let sortedPairs = [...pairs];
          const sortType = store.currentSort;
          switch (sortType) {
            case "Name (A-Z)":
              sortedPairs.sort((a, b) => a.name.localeCompare(b.name));
              break;
            case "Name (Z-A)":
              sortedPairs.sort((a, b) => b.name.localeCompare(a.name));
              break;
            case "User (A-Z)":
              sortedPairs.sort((a, b) =>
                (a.username || "").localeCompare(b.username || "")
              );
              break;
            case "User (Z-A)":
              sortedPairs.sort((a, b) =>
                (b.username || "").localeCompare(a.username || "")
              );
              break;
            case "Listeners (Hi-Lo)":
              sortedPairs.sort(
                (a, b) => (b.listeners || 0) - (a.listeners || 0)
              );
              break;
            case "Listeners (Lo-Hi)":
              sortedPairs.sort(
                (a, b) => (a.listeners || 0) - (b.listeners || 0)
              );
              break;
            default:
              break;
          }
          storeReducer({
            type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
            payload: {
              pairs: sortedPairs,
              filters: null,
              sort: store.currentSort,
            },
          });
        }
      }
      resetToMyLists();
      return;
    }
    const response = await storeRequestSender.filterPlaylists(filters);
    if (response.data.success) {
      let pairs = response.data.idNamePairs;
      let sortedPairs = [...pairs];
      const sortType = store.currentSort;
      switch (sortType) {
        case "Name (A-Z)":
          sortedPairs.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "Name (Z-A)":
          sortedPairs.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case "User (A-Z)":
          sortedPairs.sort((a, b) =>
            (a.username || "").localeCompare(b.username || "")
          );
          break;
        case "User (Z-A)":
          sortedPairs.sort((a, b) =>
            (b.username || "").localeCompare(a.username || "")
          );
          break;
        case "Listeners (Hi-Lo)":
          sortedPairs.sort((a, b) => (b.listeners || 0) - (a.listeners || 0));
          break;
        case "Listeners (Lo-Hi)":
          sortedPairs.sort((a, b) => (a.listeners || 0) - (b.listeners || 0));
          break;
        default:
          break;
      }
      storeReducer({
        type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
        payload: {
          pairs: sortedPairs,
          filters: filters,
          sort: store.currentSort,
        },
      });
    }
  };

  store.markListForDeletion = function (id) {
    async function getListToDelete(id) {
      let response = await storeRequestSender.getPlaylistById(id);
      if (response.data.success) {
        let playlist = response.data.playlist;
        storeReducer({
          type: GlobalStoreActionType.MARK_LIST_FOR_DELETION,
          payload: { id: id, playlist: playlist },
        });
      }
    }
    getListToDelete(id);
  };

  store.deleteList = function (id) {
    async function processDelete(id) {
      let response = await storeRequestSender.deletePlaylistById(id);
      store.loadIdNamePairs();
      if (response.data.success) {
        history.push("/");
      }
    }
    processDelete(id);
  };

  store.deleteMarkedList = function () {
    store.deleteList(store.listIdMarkedForDeletion);
    store.hideModals();
  };

  store.showEditSongModal = (songIndex, songToEdit) => {
    storeReducer({
      type: GlobalStoreActionType.EDIT_SONG,
      payload: { currentSongIndex: songIndex, currentSong: songToEdit },
    });
  };

  store.showCreateSongModal = () => {
    storeReducer({
      type: GlobalStoreActionType.EDIT_SONG,
      payload: {
        currentSongIndex: null,
        currentSong: { title: "", artist: "", year: "", youTubeId: "" },
      },
    });
  };

  store.hideModals = () => {
    auth.errorMessage = null;
    storeReducer({
      type: GlobalStoreActionType.HIDE_MODALS,
      payload: {},
    });
  };

  store.isDeleteListModalOpen = () => {
    return store.currentModal === CurrentModal.DELETE_LIST;
  };
  store.isEditSongModalOpen = () => {
    return store.currentModal === CurrentModal.EDIT_SONG;
  };
  store.isErrorModalOpen = () => {
    return store.currentModal === CurrentModal.ERROR;
  };
  store.isPlayPlaylistModalOpen = () => {
    return store.currentModal === CurrentModal.PLAY_PLAYLIST;
  };
  store.isEditPlaylistModalOpen = () => {
    return store.currentModal === CurrentModal.EDIT_PLAYLIST;
  };

  store.setCurrentList = function (id) {
    async function asyncSetCurrentList(id) {
      let response = await storeRequestSender.getPlaylistById(id);
      if (response.data.success) {
        let playlist = response.data.playlist;
        response = await storeRequestSender.updatePlaylistById(
          playlist.id || playlist._id,
          playlist
        );
        if (response.data.success) {
          storeReducer({
            type: GlobalStoreActionType.SET_CURRENT_LIST,
            payload: playlist,
          });
        }
      }
    }
    asyncSetCurrentList(id);
  };

  store.getPlaylistById = async function (id) {
    try {
      let response = await storeRequestSender.getPlaylistById(id);
      if (response.data.success) {
        return response.data.playlist;
      }
    } catch (error) {
      console.error("Store getPlaylistById error:", error);
    }
    return null;
  };

  store.getUserByEmail = async function (email) {
    try {
      let response = await storeRequestSender.getUserByEmail(email);
      if (response.data.success) {
        return response.data.user;
      }
    } catch (error) {
      console.error("Store getUserByEmail error:", error);
    }
    return null;
  };

  store.getUserByPlaylistId = async function (playlistId) {
    try {
      let response = await storeRequestSender.getUserByPlaylistId(playlistId);
      if (response.data.success) {
        return response.data.user;
      }
    } catch (error) {
      console.error("Store getUserByPlaylistId error:", error);
    }
    return null;
  };

  store.getPlaylistSize = function () {
    return store.currentList.songs.length;
  };

  store.addNewSong = function () {
    let index = this.getPlaylistSize();
    this.addCreateSongTransaction(
      index,
      "Untitled",
      "?",
      new Date().getFullYear(),
      "dQw4w9WgXcQ"
    );
  };

  store.createSong = function (index, song) {
    let list = store.currentList;
    list.songs.splice(index, 0, song);
    store.updateCurrentList();
  };

  store.moveSong = function (start, end) {
    let list = store.currentList;
    if (start < end) {
      let temp = list.songs[start];
      for (let i = start; i < end; i++) {
        list.songs[i] = list.songs[i + 1];
      }
      list.songs[end] = temp;
    } else if (start > end) {
      let temp = list.songs[start];
      for (let i = start; i > end; i--) {
        list.songs[i] = list.songs[i - 1];
      }
      list.songs[end] = temp;
    }
    store.updateCurrentList();
  };

  store.removeSong = function (index) {
    let list = store.currentList;
    list.songs.splice(index, 1);
    store.updateCurrentList();
  };

  store.updateSong = function (index, songData) {
    let list = store.currentList;
    let song = list.songs[index];
    song.title = songData.title;
    song.artist = songData.artist;
    song.year = songData.year;
    song.youTubeId = songData.youTubeId;
    store.updateCurrentList();
  };
  store.addNewSong = () => {
    let playlistSize = store.getPlaylistSize();
    store.addCreateSongTransaction(
      playlistSize,
      "Untitled",
      "?",
      new Date().getFullYear(),
      "dQw4w9WgXcQ"
    );
  };
  // THIS FUNCDTION ADDS A CreateSong_Transaction TO THE TRANSACTION STACK
  store.addCreateSongTransaction = (index, title, artist, year, youTubeId) => {
    // ADD A SONG ITEM AND ITS NUMBER
    let song = {
      title: title,
      artist: artist,
      year: year,
      youTubeId: youTubeId,
    };
    let transaction = new CreateSong_Transaction(store, index, song);
    tps.processTransaction(transaction);
  };

  store.addMoveSongTransaction = function (start, end) {
    let transaction = new MoveSong_Transaction(store, start, end);
    tps.processTransaction(transaction);
  };
  // THIS FUNCTION ADDS A RemoveSong_Transaction TO THE TRANSACTION STACK
  store.addRemoveSongTransaction = (song, index) => {
    //let index = store.currentSongIndex;
    //let song = store.currentList.songs[index];
    let transaction = new RemoveSong_Transaction(store, index, song);
    tps.processTransaction(transaction);
  };

  store.addUpdateSongTransaction = function (index, newSongData) {
    let song = store.currentList.songs[index];
    let oldSongData = {
      title: song.title,
      artist: song.artist,
      year: song.year,
      youTubeId: song.youTubeId,
    };
    let transaction = new UpdateSong_Transaction(
      this,
      index,
      oldSongData,
      newSongData
    );
    tps.processTransaction(transaction);
  };

  store.updateCurrentList = function () {
    async function asyncUpdateCurrentList() {
      const response = await storeRequestSender.updatePlaylistById(
        store.currentList.id || store.currentList._id,
        store.currentList
      );
      if (response.data.success) {
        storeReducer({
          type: GlobalStoreActionType.SET_CURRENT_LIST,
          payload: store.currentList,
        });
      }
    }
    asyncUpdateCurrentList();
  };

  store.undo = function () {
    tps.undoTransaction();
  };
  store.redo = function () {
    tps.doTransaction();
  };
  store.canAddNewSong = function () {
    return store.currentList !== null;
  };
  store.canUndo = function () {
    return store.currentList !== null && tps.hasTransactionToUndo();
  };
  store.canRedo = function () {
    return store.currentList !== null && tps.hasTransactionToDo();
  };
  store.canClose = function () {
    return store.currentList !== null;
  };

  // THIS FUNCTION ENABLES THE PROCESS OF EDITING A LIST NAME
  store.setIsListNameEditActive = function () {
    storeReducer({
      type: GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE,
      payload: null,
    });
  };

  function KeyPress(event) {
    if (!store.modalOpen && event.ctrlKey) {
      if (event.key === "z") {
        store.undo();
      }
      if (event.key === "y") {
        store.redo();
      }
    }
  }

  document.onkeydown = (event) => KeyPress(event);

  return (
    <GlobalStoreContext.Provider
      value={{
        store,
      }}
    >
      {props.children}
    </GlobalStoreContext.Provider>
  );
}

export default GlobalStoreContext;
export { GlobalStoreContextProvider };