import { useContext, useEffect } from "react";
import { GlobalStoreContext } from "../store";
import PlaylistCard from "./PlaylistCard.js";
import MUIDeleteModal from "./MUIDeleteModal";

import AddIcon from "@mui/icons-material/Add";
import Fab from "@mui/material/Fab";
import List from "@mui/material/List";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
/*
    This React component lists all the top5 lists in the UI.
    
    @author McKilla Gorilla
*/
const HomeScreen = () => {
  const { store } = useContext(GlobalStoreContext);

  useEffect(() => {
    store.loadIdNamePairs();
  }, []);

  function handleCreateNewList() {
    store.createNewList();
  }

  return (
    <Box id="playlist-selector">
      <Box id="playlist-selector-heading">
        <Typography variant="h3" id="playlist-selector-heading-text">
          Your Playlists
        </Typography>

        <Box sx={{ position: "absolute", right: 20 }}>
          <Fab
            color="primary"
            aria-label="add"
            id="add-list-button"
            onClick={handleCreateNewList}
          >
            <AddIcon />
          </Fab>
        </Box>
      </Box>

      <Box id="playlist-selector-list">
        <List
          sx={{
            width: "90%",
            bgcolor: "background.paper",
            borderRadius: 2,
            mb: 2,
          }}
        >
          {store.idNamePairs.map((pair) => (
            <PlaylistCard key={pair._id} idNamePair={pair} selected={false} />
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default HomeScreen;
