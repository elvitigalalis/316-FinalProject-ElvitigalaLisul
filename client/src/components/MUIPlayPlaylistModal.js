import { useContext, useState, useEffect, useRef } from "react";
import GlobalStoreContext from "../store";
import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Card from "@mui/material/Card";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import RepeatIcon from "@mui/icons-material/Repeat";
import CloseIcon from "@mui/icons-material/Close";
import AuthContext from "../auth";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 900,
  height: 730,
  bgcolor: "background.paper",
  border: "none",
  borderRadius: "12px",
  boxShadow: 24,
  p: 4,
  outline: "none",
};

export default function MUIPlayPlaylistModal() {
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);

  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  const indexRef = useRef(currentSongIndex);
  const repeatRef = useRef(isRepeat);
  const songsRef = useRef([]);

  useEffect(() => {
    indexRef.current = currentSongIndex;
  }, [currentSongIndex]);

  useEffect(() => {
    repeatRef.current = isRepeat;
  }, [isRepeat]);

  const playlist = store.currentList;
  const songs = playlist ? playlist.songs : [];

  useEffect(() => {
    songsRef.current = songs;
  }, [songs]);

  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (!playlist) return;

    async function fetchData() {
      let ownerEmail = playlist.ownerEmail;

      if (ownerEmail) {
        if (auth.user && auth.user.email === ownerEmail) {
          setUserInfo(auth.user);
        } else {
          try {
            const user = await store.getUserByEmail(ownerEmail);
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

    if (playlist._id) {
      fetchData();
    }
  }, [playlist, auth.user, store]);

  useEffect(() => {
    if (store.currentModal === "PLAY_PLAYLIST" && playlist) {
      setCurrentSongIndex(0);
      setIsPlaying(true);

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
    }
  }, [store.currentModal]);

  function loadPlayer() {
    if (!songs || songs.length === 0) return;

    if (document.getElementById("youtube-player")) {
      const newPlayer = new window.YT.Player("youtube-player", {
        height: "100%",
        width: "100%",
        videoId: songs[0].youTubeId,
        playerVars: {
          playsinline: 1,
          autoplay: 1,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
      setPlayer(newPlayer);
    }
  }

  function onPlayerReady(event) {
    event.target.playVideo();
    setIsPlaying(true);
  }

  function onPlayerStateChange(event) {
    if (event.data === 0) {
      // VIDEO ENDED
      const currentIndex = indexRef.current;
      const repeating = repeatRef.current;
      const currentSongs = songsRef.current;

      let nextIndex = currentIndex + 1;

      if (nextIndex >= currentSongs.length) {
        if (repeating) {
          nextIndex = 0;
        } else {
          setIsPlaying(false);
          return;
        }
      }

      const nextVideoId = currentSongs[nextIndex].youTubeId;
      event.target.loadVideoById(nextVideoId);

      setCurrentSongIndex(nextIndex);
      setIsPlaying(true);
    } else if (event.data === 1) {
      setIsPlaying(true);
    } else if (event.data === 2) {
      setIsPlaying(false);
    }
  }

  //playback controls
  function loadVideo(index) {
    if (!player) return;
    if (index >= 0 && index < songs.length) {
      const videoId = songs[index].youTubeId;
      player.loadVideoById(videoId);
      setCurrentSongIndex(index);
      setIsPlaying(true);
    }
  }

  function handlePrev() {
    let newIndex = indexRef.current - 1;
    if (newIndex < 0) newIndex = songs.length - 1;
    loadVideo(newIndex);
  }

  function handleNext() {
    let newIndex = indexRef.current + 1;
    if (newIndex >= songs.length) newIndex = 0;
    loadVideo(newIndex);
  }

  function handleTogglePlay() {
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
    setIsPlaying(!isPlaying);
  }

  function handleToggleRepeat() {
    setIsRepeat(!isRepeat);
  }

  function handleSongClick(index) {
    loadVideo(index);
  }

  function handleCloseModal() {
    if (player) {
      player.stopVideo();
      player.destroy();
      setPlayer(null);
    }
    store.hideModals();
  }

  // avatar logic
  let avatarSrc = "";
  let avatarText = "P";
  let currentUsername = "Loading...";

  if (userInfo) {
    if (userInfo.username) {
      currentUsername = userInfo.username;
      avatarText = userInfo.username.charAt(0).toUpperCase();
    } else {
      currentUsername = "Unknown Owner";
    }
    avatarSrc = userInfo.profilePicture || "";
  } else if (playlist && playlist.username) {
    currentUsername = playlist.username;
    avatarText = playlist.username.charAt(0).toUpperCase();
  }

  const isOpen = store.isPlayPlaylistModalOpen() && playlist !== null;

  return (
    <Modal open={isOpen} onClose={handleCloseModal}>
      <Box sx={style}>
        {/* header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            Play Playlist
          </Typography>
          <IconButton onClick={handleCloseModal}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* two columns */}
        <Box sx={{ display: "flex", height: "85%", gap: 3 }}>
          <Box sx={{ width: "40%", display: "flex", flexDirection: "column" }}>
            {/* playlist owner information */}
            <Card
              sx={{
                p: 2,
                mb: 2,
                display: "flex",
                alignItems: "center",
                bgcolor: "#f5f5f5",
              }}
            >
              <Avatar sx={{ bgcolor: "primary.main", mr: 2 }} src={avatarSrc}>
                {avatarText}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {playlist?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  By: {currentUsername}
                </Typography>
              </Box>
            </Card>

            {/* queue of songs */}
            <Box
              sx={{
                flexGrow: 1,
                overflowY: "auto",
                border: "1px solid #e0e0e0",
                borderRadius: "4px",
              }}
            >
              {songs.map((song, index) => (
                <Box
                  key={index}
                  onClick={() => handleSongClick(index)}
                  sx={{
                    p: 1.5,
                    cursor: "pointer",
                    borderBottom: "1px solid #f0f0f0",
                    bgcolor:
                      currentSongIndex === index ? "#CBC3E3" : "transparent",
                    color: currentSongIndex === index ? "#301974" : "inherit",
                    fontWeight: currentSongIndex === index ? "bold" : "normal",
                    "&:hover": { bgcolor: "#f0ebf8" },
                  }}
                >
                  <Typography variant="body2">
                    {index + 1}. {song.title} by {song.artist} ({song.year})
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* right col */}
          <Box sx={{ width: "60%", display: "flex", flexDirection: "column" }}>
            {/* youtube embedding */}
            <Box
              sx={{
                flexGrow: 1,
                bgcolor: "black",
                mb: 2,
                borderRadius: "8px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div id="youtube-player"></div>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                bgcolor: "#f5f5f5",
                p: 2,
                borderRadius: "8px",
              }}
            >
              {/* song information display */}
              <Typography
                variant="h6"
                align="center"
                noWrap
                sx={{ width: "100%", mb: 1 }}
              >
                {songs[currentSongIndex]?.title || "Select a song"}
              </Typography>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                align="center"
                sx={{ mb: 2 }}
              >
                {songs[currentSongIndex]?.artist || ""}
              </Typography>

              {/* bar for going through songs */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <IconButton onClick={handlePrev} size="large">
                  <SkipPreviousIcon fontSize="inherit" />
                </IconButton>

                <IconButton
                  onClick={handleTogglePlay}
                  size="large"
                  sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": { bgcolor: "primary.dark" },
                  }}
                >
                  {isPlaying ? (
                    <PauseIcon fontSize="large" />
                  ) : (
                    <PlayArrowIcon fontSize="large" />
                  )}
                </IconButton>

                <IconButton onClick={handleNext} size="large">
                  <SkipNextIcon fontSize="inherit" />
                </IconButton>
              </Box>

              {/* repeat button */}
              <Button
                onClick={handleToggleRepeat}
                startIcon={<RepeatIcon />}
                variant={isRepeat ? "contained" : "text"}
                size="small"
                sx={{ mt: 2 }}
              >
                {isRepeat ? "Repeat On" : "Repeat Off"}
              </Button>
            </Box>
          </Box>
        </Box>
        {/* close button */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, mb: 2 }}>
          <Button variant="contained" onClick={handleCloseModal}>
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
