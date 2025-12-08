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
import List from "@mui/material/List";
import InputAdornment from "@mui/material/InputAdornment";

import CloseIcon from "@mui/icons-material/Close";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";

import SongCard from "./SongCard";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  height: "80vh",
  bgcolor: "background.paper",
  border: "none",
  borderRadius: "12px",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
};

export default function MUIEditPlaylistModal() {
  const { store } = useContext(GlobalStoreContext);
  const [name, setName] = useState("");

  useEffect(() => {
    if (store.currentList) {
      setName(store.currentList.name);
    }
  }, [store.currentList]);

  function handleUpdateName(event) {
    setName(event.target.value);
  }

  // saves and closes the modal
  function handleConfirmAndClose() {
    if (store.currentList && name !== store.currentList.name) {
      store.changeListName(store.currentList._id, name);
    }
    store.closeCurrentList();
    // store.hideModals();
    store.loadIdNamePairs();
  }

  function handleKeyPress(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleConfirmAndClose();
    }
  }

  function handleClearName() {
    setName("");
  }

  function handleAddSong() {
    store.addNewSong();
  }

  function handleUndo() {
    store.undo();
  }

  function handleRedo() {
    store.redo();
  }

  function handleCloseModal() {
    handleConfirmAndClose();
  }

  const isOpen =
    store.currentList !== null && store.currentModal === "EDIT_PLAYLIST";

  return (
    <Modal open={isOpen} onClose={handleCloseModal}>
      <Box sx={style} onKeyDown={handleKeyPress}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
          Edit Playlist
        </Typography>

        {/* playlist renaming */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            value={name}
            onChange={handleUpdateName}
            onKeyDown={handleKeyPress}
            size="small"
            label="Playlist Name"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleClearName} edge="end">
                    <CloseIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            onClick={handleAddSong}
            sx={{ minWidth: "50px", height: "40px" }}
            color="primary"
          >
            <LibraryAddIcon />
          </Button>
        </Box>

        <Divider />

        {/* song management list */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            my: 2,
            pr: 1,
            "&::-webkit-scrollbar": { width: "8px" },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#ccc",
              borderRadius: "4px",
            },
          }}
        >
          <List>
            {store.currentList &&
              store.currentList.songs.map((song, index) => (
                <SongCard key={index} index={index} song={song} />
              ))}
          </List>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* toolbar actions */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleUndo}
              disabled={!store.canUndo()}
              startIcon={<UndoIcon />}
            >
              Undo
            </Button>
            <Button
              variant="outlined"
              onClick={handleRedo}
              disabled={!store.canRedo()}
              endIcon={<RedoIcon />}
            >
              Redo
            </Button>
          </Box>

          {/* close button */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleCloseModal}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
