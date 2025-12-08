import { useContext, useState, useEffect } from "react";
import { GlobalStoreContext } from "../store";

import AuthContext from "../auth";

import Box from "@mui/material/Box";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";

import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import { StyledEngineProvider } from "@mui/material";

/*
    This is a card in our list of top 5 lists.
*/
function PlaylistCard(props) {
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);
  const [editActive, setEditActive] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [text, setText] = useState("");
  const { idNamePair } = props;

  const [fullPlaylist, setFullPlaylist] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    async function fetchData() {
      console.log("Fetching full playlist for id: " + idNamePair._id);
      let playlistData = null;
      let ownerEmail = null;

      try {
        playlistData = await store.getPlaylistById(idNamePair._id);
        // console.log("Fetched playlist data:", playlistData);
        // console.log("Songs", playlistData.data.playlist.songs);
        setFullPlaylist(playlistData);
        ownerEmail = playlistData.ownerEmail;
      } catch (error) {
        console.error("Error fetching full playlist:", error);
        return;
      }
    
      if (ownerEmail) {
        if (auth.user && auth.user.email === ownerEmail) {
          setUserInfo(auth.user);
          console.log("Using auth user for: " + ownerEmail);
        } else {
          console.log("Fetching user for: " + ownerEmail);
          try {
            const user = await store.getUserByEmail(ownerEmail);
            // console.log("Fetched user data:", user.data.user);
            setUserInfo(user);
          } catch (error) {
            console.error("Error fetching user:", error);
            setUserInfo({
              username: "Unknown Owner",
              email: ownerEmail,
              profilePicture: null,
            });
          }
        }
      }
    }

    if (idNamePair._id) {
      fetchData();
    }
  }, [idNamePair, auth.user]);

  const pData = fullPlaylist || {};
  let avatarSrc = "";
  let avatarText = "P";
  let currentUsername = "Loading...";
  let listeners = pData.listenerCount || 0;
  let songs = pData.songs || [];

  if (userInfo) {
    if (userInfo.username) {
      currentUsername = userInfo.username;
      avatarText = userInfo.username.charAt(0).toUpperCase();
    } else {
      currentUsername = "Unknown Owner";
    }
    avatarSrc = userInfo.profilePicture || "";
  }

  const isOwner = auth.user && pData.ownerEmail === auth.user.email;

  function handleToggleExpand() {
    setIsExpanded(!isExpanded);
  }

  function handleLoadList(event, id) {
    console.log("handleLoadList for " + id);
    if (!event.target.disabled) {
      let _id = event.target.id;
      if (_id.indexOf("list-card-text-") >= 0)
        _id = ("" + _id).substring("list-card-text-".length);

      console.log("load " + event.target.id);
      store.setCurrentList(id);
    }
  }

  function handleToggleEdit(event) {
    event.stopPropagation();
    toggleEdit();
  }

  function toggleEdit() {
    let newActive = !editActive;
    if (newActive) {
      store.setIsListNameEditActive();
    }
    setEditActive(newActive);
  }

  async function handleDeleteList(event, id) {
    event.stopPropagation();
    store.markListForDeletion(id);
  }

  function handlePlay(event) {
    event.stopPropagation();
    store.playPlaylist(idNamePair._id);
    console.log("playing playlist " + idNamePair._id);
  }

  function handleDuplicate(event) {
    event.stopPropagation();
    store.duplicatePlaylist(idNamePair._id);
    console.log("duplicating playlist " + idNamePair._id);
  }

  function handleKeyPress(event) {
    if (event.code === "Enter") {
      let id = event.target.id.substring("list-".length);
      store.changeListName(id, text);
      toggleEdit();
    }
  }
  function handleUpdateText(event) {
    setText(event.target.value);
  }

  let cardElement = (
    <Box
      id={idNamePair._id}
      key={idNamePair._id}
      sx={{
        borderRadius: "12px",
        p: 2,
        mb: 2,
        bgcolor: "#ffffff",
        border: "1px solid #ccc",
        display: "flex",
        flexDirection: "column",
        width: "95%",
        transition: "0.3s",
        "&:hover": {
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            flexGrow: 1,
          }}
          onClick={handleToggleExpand}
        >
          <Avatar sx={{ bgcolor: "primary.main", mr: 2 }} src={avatarSrc}>
            {avatarText}
          </Avatar>

          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" fontWeight="bold">
              {idNamePair.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              By: {currentUsername}
            </Typography>
          </Box>
        </Box>

        {/* Listener Count */}
        <Box sx={{ display: "flex", alignItems: "center", mr: 3 }}>
          <Typography
            variant="body2"
            sx={{
              border: "1px solid",
              borderColor: "secondary.main",
              color: "secondary.main",
              px: 1.5,
              py: 0.5,
              borderRadius: 5,
              fontWeight: "bold",
            }}
          >
            {listeners} Listeners
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {isOwner && (
            <>
              <Button
                onClick={(event) => handleDeleteList(event, idNamePair._id)}
                variant="outlined"
                size="small"
                color="error"
              >
                Delete
              </Button>
              <Button
                onClick={handleToggleEdit}
                variant="outlined"
                size="small"
              >
                Edit
              </Button>
            </>
          )}

          <Button onClick={handleDuplicate} variant="outlined" size="small">
            Copy
          </Button>
          <Button
            onClick={handlePlay}
            variant="contained"
            size="small"
            sx={{ minWidth: "auto" }}
          >
            Play
          </Button>

          <IconButton onClick={handleToggleExpand} aria-label="expand">
            {isExpanded ? (
              <KeyboardDoubleArrowUpIcon />
            ) : (
              <KeyboardDoubleArrowDownIcon />
            )}
          </IconButton>
        </Box>
      </Box>

      {isExpanded && (
        <Box sx={{ mt: 2, borderTop: "1px solid #eee", pt: 2, pl: 2 }}>
          {songs.length > 0 ? (
            songs.map((song, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{ py: 0.5, fontSize: "1.1rem" }}
              >
                {index + 1}. {song.title} by {song.artist} ({song.year})
              </Typography>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No songs in this playlist.
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );

  if (editActive) {
    cardElement = (
      <TextField
        margin="normal"
        required
        fullWidth
        id={"list-" + idNamePair._id}
        label="Playlist Name"
        name="name"
        autoComplete="Playlist Name"
        className="list-card"
        onKeyPress={handleKeyPress}
        onChange={handleUpdateText}
        defaultValue={idNamePair.name}
        inputProps={{ style: { fontSize: 48 } }}
        InputLabelProps={{ style: { fontSize: 24 } }}
        autoFocus
      />
    );
  }
  return cardElement;
}

export default PlaylistCard;
