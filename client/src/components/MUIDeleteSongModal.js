import { useContext } from "react";
import GlobalStoreContext from "../store";
import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  border: "none",
  borderRadius: "8px",
  boxShadow: 24,
  p: 4,
};

export default function MUIDeleteSongModal() {
  const { store } = useContext(GlobalStoreContext);

  let songTitle = "";
  if (store.songMarkedForRemoval) {
    songTitle = store.songMarkedForRemoval.title;
  }

  function handleConfirmRemove(event) {
    store.removeCatalogSong();
  }

  function handleCloseModal(event) {
    store.hideModals();
  }

  return (
    <Modal
      open={store.songMarkedForRemoval !== null}
      onClose={handleCloseModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        {/* header */}
        <Typography
          id="modal-modal-title"
          variant="h5"
          fontWeight="bold"
          component="h2"
        >
          Remove Song?
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* content */}
        <Typography
          id="modal-modal-description"
          variant="h6"
          sx={{ mt: 2, color: "text.primary", fontSize: "1.1rem" }}
        >
          Are you sure you want to remove <b>{songTitle}</b> from the catalog?
        </Typography>

        <Typography
          variant="body2"
          sx={{ mt: 1, mb: 4, color: "text.secondary" }}
        >
          Doing so will remove it from all of your playlists.
        </Typography>

        {/* footer */}
        <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirmRemove}
            sx={{ minWidth: "120px" }}
          >
            Remove Song
          </Button>

          <Button
            variant="outlined"
            onClick={handleCloseModal}
            sx={{ minWidth: "120px" }}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}