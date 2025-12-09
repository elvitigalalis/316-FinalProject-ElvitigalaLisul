import { useContext, useState } from "react";
import { GlobalStoreContext } from "../store";
import AuthContext from "../auth";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";

function SongCatalogSongCard({ song }) {
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [subMenuEl, setSubMenuEl] = useState(null);

  const isMenuOpen = Boolean(anchorEl);
  const isSubMenuOpen = Boolean(subMenuEl);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSubMenuEl(null);
  };

  const handleSubMenuOpen = (event) => setSubMenuEl(event.currentTarget);
  const handleSubMenuClose = () => setSubMenuEl(null);

  const handlePlaySong = () => {
    // Implement play logic for the sidebar player if needed
    console.log("Play song in sidebar:", song.title);
  };

  const handleEditSong = () => {
    store.showEditSongModal(null, song); // Assuming showEditSongModal handles catalog songs differently or same
    handleMenuClose();
  };

  const handleRemoveSong = () => {
    store.markSongForRemoval(song._id); // You need to implement this in store
    handleMenuClose();
  };

  const handleAddToPlaylist = (playlistId) => {
    store.addSongToPlaylist(playlistId, song);
    handleMenuClose();
  };

  // Only the creator can Edit/Remove
  const canEdit = auth.user && auth.user.email === song.ownerEmail;

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 2,
        mb: 2,
        borderRadius: 2,
        bgcolor: "#f5f5f5",
        position: "relative",
      }}
    >
      {/* Primary Info */}
      <Box sx={{ pr: 4 }}>
        <Typography
          variant="h6"
          fontWeight="bold"
          onClick={handlePlaySong}
          sx={{ cursor: "pointer" }}
        >
          {song.title} by {song.artist} ({song.year})
        </Typography>
      </Box>

      {/* Metrics */}
      <Box sx={{ display: "flex", gap: 4, mt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Listens: {song.listens || 0}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Playlists: {song.playlistCount || 0}
        </Typography>
      </Box>

      {/* Context Menu Trigger */}
      <IconButton
        onClick={handleMenuOpen}
        sx={{ position: "absolute", top: 8, right: 8 }}
      >
        <MoreVertIcon />
      </IconButton>

      {/* Main Menu */}
      <Menu anchorEl={anchorEl} open={isMenuOpen} onClose={handleMenuClose}>
        <MenuItem onMouseEnter={handleSubMenuOpen}>Add to Playlist ▸</MenuItem>
        {canEdit && <MenuItem onClick={handleEditSong}>Edit Song</MenuItem>}
        {canEdit && (
          <MenuItem onClick={handleRemoveSong}>Remove from Catalog</MenuItem>
        )}
      </Menu>

      {/* Sub Menu (Playlists) */}
      <Menu
        anchorEl={subMenuEl}
        open={isSubMenuOpen}
        onClose={handleSubMenuClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
          {store.idNamePairs &&
            store.idNamePairs.map((playlist) => (
              <MenuItem
                key={playlist._id}
                onClick={() => handleAddToPlaylist(playlist._id)}
              >
                {playlist.name}
              </MenuItem>
            ))}
          {(!store.idNamePairs || store.idNamePairs.length === 0) && (
            <MenuItem disabled>No Playlists</MenuItem>
          )}
        </Box>
      </Menu>
    </Card>
  );
}

export default SongCatalogSongCard;