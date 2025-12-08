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
  width: 450,
  bgcolor: "background.paper",
  border: "none",
  borderRadius: "12px",
  boxShadow: 24,
  p: 4,
};

export default function MUIDeleteModal() {
  const { store } = useContext(GlobalStoreContext);

  let name = "";
  if (store.listMarkedForDeletion) {
    name = store.listMarkedForDeletion.name;
  }

  function handleDeleteList(event) {
    store.deleteMarkedList();
  }

  function handleCloseModal(event) {
    store.hideModals();
  }

  return (
    <Modal
      open={store.listMarkedForDeletion !== null}
      onClose={handleCloseModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography
          id="modal-modal-title"
          variant="h5"
          fontWeight="bold"
          component="h2"
        >
          Delete Playlist
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography
          id="modal-modal-description"
          variant="body1"
          sx={{ mt: 2, color: "text.primary", fontSize: "1.1rem" }}
        >
          Are you sure you want to delete the <b>{name}</b> playlist?
        </Typography>

        <Typography
          variant="body2"
          sx={{ mt: 1, mb: 4, color: "text.secondary" }}
        >
          This action cannot be undone.
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDeleteList}
            sx={{ minWidth: "100px" }}
          >
            Delete Playlist
          </Button>

          <Button
            variant="outlined"
            onClick={handleCloseModal}
            sx={{ minWidth: "100px" }}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
