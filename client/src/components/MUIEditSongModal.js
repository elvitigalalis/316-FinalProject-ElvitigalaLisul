import { useContext, useState, useEffect } from "react";
import GlobalStoreContext from "../store";
import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import ClearIcon from "@mui/icons-material/Clear";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  border: "none",
  borderRadius: "12px",
  boxShadow: 24,
  p: 0,
  overflow: "hidden",
};

export default function MUIEditSongModal() {
  const { store } = useContext(GlobalStoreContext);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [year, setYear] = useState("");
  const [youTubeId, setYouTubeId] = useState("");

  useEffect(() => {
    if (store.currentSong) {
      setTitle(store.currentSong.title);
      setArtist(store.currentSong.artist);
      setYear(store.currentSong.year);
      setYouTubeId(store.currentSong.youTubeId);
    }
  }, [store.currentSong, store.currentModal]);

  function handleConfirmEditSong() {
    let newSongData = {
      title: title,
      artist: artist,
      year: parseInt(year),
      youTubeId: youTubeId,
    };

    if (store.currentSong._id) {
      store.updateCatalogSong(
        store.currentSong._id,
        newSongData,
        store.currentSong.youTubeId
      );
    } else {
      store.createCatalogSong(newSongData);
    }
  }

  function handleCancelEditSong() {
    store.hideModals();
  }

  const endAdornment = (setValue) => (
    <InputAdornment position="end">
      <IconButton onClick={() => setValue("")} edge="end">
        <ClearIcon />
      </IconButton>
    </InputAdornment>
  );

  return (
    <Modal
      open={store.currentModal === "EDIT_SONG"}
      onClose={handleCancelEditSong}
    >
      <Box sx={style}>
        <Box sx={{ bgcolor: "#eee", p: 2, borderBottom: "1px solid #ccc" }}>
          <Typography variant="h5" fontWeight="bold">
            Edit Song
          </Typography>
        </Box>

        <Box sx={{ p: 4, display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField
            label="Title"
            fullWidth
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            InputProps={{ endAdornment: endAdornment(setTitle) }}
          />
          <TextField
            label="Artist"
            fullWidth
            variant="outlined"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            InputProps={{ endAdornment: endAdornment(setArtist) }}
          />
          <TextField
            label="Year"
            fullWidth
            variant="outlined"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            InputProps={{ endAdornment: endAdornment(setYear) }}
          />
          <TextField
            label="YouTube ID"
            fullWidth
            variant="outlined"
            value={youTubeId}
            onChange={(e) => setYouTubeId(e.target.value)}
            InputProps={{ endAdornment: endAdornment(setYouTubeId) }}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              gap: 2,
              mt: 2,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirmEditSong}
              sx={{
                minWidth: "120px",
                fontWeight: "bold",
                boxShadow: "none",
              }}
            >
              Confirm
            </Button>
            <Button
              variant="outlined"
              onClick={handleCancelEditSong}
              sx={{ minWidth: "120px", fontWeight: "bold" }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}
