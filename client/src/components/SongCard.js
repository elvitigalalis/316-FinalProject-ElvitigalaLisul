import { useContext } from "react";
import { GlobalStoreContext } from "../store";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Card from "@mui/material/Card";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ClearIcon from "@mui/icons-material/Clear";

function SongCard(props) {
  const { store } = useContext(GlobalStoreContext);
  const { song, index } = props;

  // dragging songs
  function handleDragStart(event) {
    event.dataTransfer.setData("song", index);
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDragEnter(event) {
    event.preventDefault();
  }

  function handleDragLeave(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();
    let targetIndex = index;
    let sourceIndex = Number(event.dataTransfer.getData("song"));
    store.addMoveSongTransaction(sourceIndex, targetIndex);
  }

  // song actions
  function handleRemoveSong(event) {
    event.stopPropagation();
    store.addRemoveSongTransaction(song, index);
  }

  function handleDuplicateSong(event) {
    event.stopPropagation();

    let newTitle = song.title + " (Copy)";
    const songs = store.currentList.songs;

    // this is to counteract duplicate songs with the same title, artist, year, and youtubeId
    // I made it recursive to make sure the copy's name also isn't taken.
    while (
      songs.some(
        (s) =>
          s.title === newTitle &&
          s.artist === song.artist &&
          s.year === song.year &&
          s.youTubeId === song.youTubeId
      )
    ) {
      newTitle += " (Copy)";
    }

    store.addCreateSongTransaction(
      index + 1,
      newTitle,
      song.artist,
      song.year,
      song.youTubeId
    );
  }

  return (
    // the song cards are formatted with drag and drop support
    <Card
      key={index}
      id={"song-" + index + "-card"}
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 1.5,
        mb: 1,
        bgcolor: "background.paper",
        border: "1px solid #e0e0e0",
        cursor: "grab",
        "&:hover": { bgcolor: "#f5f5f5" },
      }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      draggable="true"
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexGrow: 1,
          overflow: "hidden",
        }}
      >
        <Typography variant="body1" noWrap>
          {index + 1}. <strong>{song.title}</strong> by {song.artist} (
          {song.year})
        </Typography>
      </Box>

      {/* buttons for removing and duplicating */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* duplicating */}
        <IconButton
          onClick={handleDuplicateSong}
          color="primary"
          size="small"
          aria-label="edit"
        >
          <ContentCopyIcon fontSize="small" />
        </IconButton>

        {/* deleting */}
        <IconButton
          onClick={handleRemoveSong}
          color="error"
          size="small"
          aria-label="delete"
        >
          <ClearIcon fontSize="small" />
        </IconButton>
      </Box>
    </Card>
  );
}

export default SongCard;
