import { useContext, useEffect, useState, useRef } from "react";
import { GlobalStoreContext } from "../store";
import AuthContext from "../auth";
import SongCatalogSongCard from "./SongCatalogSongCard";
import MUIEditSongModal from "./MUIEditSongModal";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";
import Fab from "@mui/material/Fab";
import List from "@mui/material/List";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MUIDeleteSongModal from "./MUIDeleteSongModal";

const SongsScreen = () => {
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);

  const [filters, setFilters] = useState({
    title: "",
    artist: "",
    year: "",
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const [sortLabel, setSortLabel] = useState("Listens (Hi-Lo)");
  const [searchActive, setSearchActive] = useState(false);
  const [player, setPlayer] = useState(null);

  // initial load
  useEffect(() => {
    store.loadSongCatalog();
    store.loadUserPlaylists();

    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      loadPlayer();
    };

    if (window.YT && window.YT.Player) {
      loadPlayer();
    }
  }, []);

  function loadPlayer() {
    if (player) return;
    const newPlayer = new window.YT.Player("youtube-player-catalog", {
      height: "100%",
      width: "100%",
      videoId: "dQw4w9WgXcQ",
      playerVars: {
        playsinline: 1,
        origin: window.location.origin,
      },
    });
    setPlayer(newPlayer);
  }

  function handlePlaySong(youTubeId) {
    if (player && player.loadVideoById) {
      player.loadVideoById(youTubeId);
    }
  }

  const handleFilterChange = (prop) => (event) => {
    setFilters({ ...filters, [prop]: event.target.value });
  };

  const handleClearField = (prop) => {
    setFilters({ ...filters, [prop]: "" });
  };

  const handleClearAll = () => {
    setFilters({ title: "", artist: "", year: "" });
    setSearchActive(false);
    store.loadSongCatalog();
  };

  const handleSearch = () => {
    setSearchActive(true);
    store.searchSongs(filters);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") handleSearch();
  };

  const handleSortClick = (event) => setAnchorEl(event.currentTarget);
  const handleSortClose = () => setAnchorEl(null);

  const handleSortSelect = (label) => {
    setSortLabel(label);
    handleSortClose();
  };

  const handleCreateNewSong = () => {
    store.showCreateSongModal();
  };

  // sorting logic
  let sortedSongs = [];
  if (store.songCatalog) {
    sortedSongs = [...store.songCatalog];
    if (!searchActive && auth.user) {
      sortedSongs = sortedSongs.filter(
        (song) => song.ownerEmail === auth.user.email
      );
    }
    switch (sortLabel) {
      case "Listens (Hi-Lo)":
        sortedSongs.sort((a, b) => (b.listens || 0) - (a.listens || 0));
        break;
      case "Listens (Lo-Hi)":
        sortedSongs.sort((a, b) => (a.listens || 0) - (b.listens || 0));
        break;
      case "Playlists (Hi-Lo)":
        sortedSongs.sort(
          (a, b) => (b.playlistCount || 0) - (a.playlistCount || 0)
        );
        break;
      case "Playlists (Lo-Hi)":
        sortedSongs.sort(
          (a, b) => (a.playlistCount || 0) - (b.playlistCount || 0)
        );
        break;
      case "Title (A-Z)":
        sortedSongs.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "Title (Z-A)":
        sortedSongs.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "Artist (A-Z)":
        sortedSongs.sort((a, b) => a.artist.localeCompare(b.artist));
        break;
      case "Artist (Z-A)":
        sortedSongs.sort((a, b) => b.artist.localeCompare(a.artist));
        break;
      case "Year (Hi-Lo)":
        sortedSongs.sort((a, b) => b.year - a.year);
        break;
      case "Year (Lo-Hi)":
        sortedSongs.sort((a, b) => a.year - b.year);
        break;
      default:
        break;
    }
  }
  const isGuest = auth.user && auth.user.email === "GUEST@GUEST.com";

  const sortMenu = (
    <Menu anchorEl={anchorEl} open={isMenuOpen} onClose={handleSortClose}>
      <MenuItem onClick={() => handleSortSelect("Listens (Hi-Lo)")}>
        Listens (Hi-Lo)
      </MenuItem>
      <MenuItem onClick={() => handleSortSelect("Listens (Lo-Hi)")}>
        Listens (Lo-Hi)
      </MenuItem>
      <MenuItem onClick={() => handleSortSelect("Playlists (Hi-Lo)")}>
        Playlists (Hi-Lo)
      </MenuItem>
      <MenuItem onClick={() => handleSortSelect("Playlists (Lo-Hi)")}>
        Playlists (Lo-Hi)
      </MenuItem>
      <MenuItem onClick={() => handleSortSelect("Title (A-Z)")}>
        Title (A-Z)
      </MenuItem>
      <MenuItem onClick={() => handleSortSelect("Title (Z-A)")}>
        Title (Z-A)
      </MenuItem>
      <MenuItem onClick={() => handleSortSelect("Artist (A-Z)")}>
        Artist (A-Z)
      </MenuItem>
      <MenuItem onClick={() => handleSortSelect("Artist (Z-A)")}>
        Artist (Z-A)
      </MenuItem>
      <MenuItem onClick={() => handleSortSelect("Year (Hi-Lo)")}>
        Year (Hi-Lo)
      </MenuItem>
      <MenuItem onClick={() => handleSortSelect("Year (Lo-Hi)")}>
        Year (Lo-Hi)
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1, height: "85vh", overflow: "hidden" }}>
      <Grid container sx={{ height: "100%" }}>
        {/* left sidebar */}
        <Grid
          item
          xs={4}
          sx={{
            height: "100%",
            bgcolor: "background.paper",
            borderRight: "1px solid #ccc",
            p: 2,
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
            Songs Catalog
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {["title", "artist", "year"].map((key) => (
              <TextField
                key={key}
                label={`by ${key.charAt(0).toUpperCase() + key.slice(1)}`}
                variant="outlined"
                size="small"
                fullWidth
                value={filters[key]}
                onChange={handleFilterChange(key)}
                onKeyDown={handleKeyPress}
                InputProps={{
                  endAdornment: filters[key] && (
                    <IconButton
                      size="small"
                      onClick={() => handleClearField(key)}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
            ))}
          </Box>

          <Box sx={{ mt: 3, display: "flex", gap: 1 }}>
            <Button variant="contained" fullWidth onClick={handleSearch}>
              Search
            </Button>
            <Button variant="outlined" fullWidth onClick={handleClearAll}>
              Clear
            </Button>
          </Box>

          {/* media player at bottom */}
          <Box sx={{ mt: "auto", pt: 2 }}>
            <div
              id="youtube-player-catalog"
              style={{
                width: "100%",
                height: "200px",
                backgroundColor: "#000",
              }}
            ></div>
          </Box>
        </Grid>

        {/* right panel */}
        <Grid
          item
          xs={8}
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.default",
            position: "relative",
          }}
        >
          {/* status bar */}
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid #ccc",
              bgcolor: "background.paper",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="body1"
              onClick={handleSortClick}
              sx={{
                cursor: "pointer",
                fontWeight: "bold",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Sort: {sortLabel} ▾
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {sortedSongs.length} Songs
            </Typography>
            {sortMenu}
          </Box>

          {/* list body */}
          <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
            <List>
              {sortedSongs.map((song) => (
                <SongCatalogSongCard
                  key={song._id}
                  song={song}
                  handlePlaySong={handlePlaySong}
                />
              ))}
            </List>
          </Box>

          {/* creation action - HIDDEN FOR GUESTS */}
          {!isGuest && (
            <Fab
              color="primary"
              aria-label="add"
              onClick={handleCreateNewSong}
              sx={{ position: "absolute", bottom: 20, left: 20 }}
            >
              <AddIcon />
            </Fab>
          )}
        </Grid>
      </Grid>

      {/* modals */}
      <MUIEditSongModal />
      <MUIDeleteSongModal />
    </Box>
  );
};

export default SongsScreen;
