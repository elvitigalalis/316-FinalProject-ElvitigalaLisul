import { useContext, useEffect, useState } from "react";
import { GlobalStoreContext } from "../store";
import PlaylistCard from "./PlaylistCard.js";
import MUIDeleteModal from "./MUIDeleteModal";
import MUIPlayPlaylistModal from "./MUIPlayPlaylistModal.js";

import AuthContext from "../auth";

import AddIcon from "@mui/icons-material/Add";
import Fab from "@mui/material/Fab";
import List from "@mui/material/List";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MUIEditPlaylistModal from "./MUIEditPlaylistModal.js";

/*
    This React component lists all the top5 lists in the UI.
    
    @author McKilla Gorilla
    @author elvitigalalis
*/
const HomeScreen = () => {
  const { store } = useContext(GlobalStoreContext);

  const [filters, setFilters] = useState({
    name: "",
    user: "",
    song: "",
    artist: "",
    year: "",
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const [sortLabel, setSortLabel] = useState("Listeners (Hi-Lo)");

  useEffect(() => {
    store.loadIdNamePairs();
  }, []);

  function handleCreateNewList() {
    store.createNewList();
  }

  const handleSortClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setAnchorEl(null);
  };

  const handleSortSelect = (sortOption) => {
    setSortLabel(sortOption);
    handleSortClose();
    console.log("Sorting by: ", sortOption);
    // store.sortPlaylists(sortOption);
  };

  const handleFilterChange = (prop) => (event) => {
    setFilters({ ...filters, [prop]: event.target.value });
  };

  const handleClearField = (prop) => (event) => {
    setFilters({ ...filters, [prop]: "" });
  };

  const handleClearAll = () => {
    setFilters({
      name: "",
      user: "",
      song: "",
      artist: "",
      year: "",
    });
  };

  const handleSearch = () => {
    console.log("searching with filters: ", filters);
    // store.filterPlaylists(filters);
  };

  const sortMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      open={isMenuOpen}
      onClose={handleSortClose}
    >
      <MenuItem onClick={() => handleSortSelect("Listeners (Hi-Lo)")}>
        Listeners (Hi-Lo)
      </MenuItem>
      <MenuItem onClick={() => handleSortSelect("Listeners (Lo-Hi)")}>
        Listeners (Lo-Hi)
      </MenuItem>
      <MenuItem onClick={() => handleSortSelect("Name (A-Z)")}>
        Name (A-Z)
      </MenuItem>
      <MenuItem onClick={() => handleSortSelect("Name (Z-A)")}>
        Name (Z-A)
      </MenuItem>
      <MenuItem onClick={() => handleSortSelect("User (A-Z)")}>
        User (A-Z)
      </MenuItem>
      <MenuItem onClick={() => handleSortSelect("User (Z-A)")}>
        User (Z-A)
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1, height: "85vh", overflow: "hidden" }}>
      <Grid container sx={{ height: "100%" }}>
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
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            Playlists
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {["name", "user", "song", "artist", "year"].map((key) => (
              <TextField
                key={key}
                label={`Filter by ${
                  key.charAt(0).toUpperCase() + key.slice(1)
                }`}
                variant="outlined"
                size="small"
                fullWidth
                value={filters[key]}
                onChange={handleFilterChange(key)}
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

          <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 1 }}>
            <Button variant="contained" onClick={handleSearch}>
              Search
            </Button>
            <Button variant="outlined" onClick={handleClearAll}>
              Clear All
            </Button>
          </Box>
        </Grid>

        <Grid
          item
          xs={8}
          sx={{
            height: "100%",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.default",
          }}
        >
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
            <Box>
              <Typography
                variant="body1"
                onClick={handleSortClick}
                sx={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Sort By: {sortLabel} ▾
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              {store.idNamePairs ? store.idNamePairs.length : 0} Playlists
            </Typography>
            {sortMenu}
          </Box>

          <Box sx={{ flexGrow: 1, overflowY: "auto", p: 0 }}>
            <List sx={{ width: "100%" }}>
              {store.idNamePairs.map((pair) => (
                <PlaylistCard
                  key={pair._id}
                  idNamePair={pair}
                  selected={false}
                />
              ))}
            </List>
          </Box>

          <Fab
            color="primary"
            aria-label="add"
            onClick={handleCreateNewList}
            sx={{ position: "absolute", bottom: 20, right: 20 }}
          >
            <AddIcon />
          </Fab>
        </Grid>
      </Grid>
      <MUIDeleteModal />
      <MUIPlayPlaylistModal />
      <MUIEditPlaylistModal />
    </Box>
  );
};

export default HomeScreen;
