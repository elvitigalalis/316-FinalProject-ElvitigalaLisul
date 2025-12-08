import React from "react";
import { Box, Button, Typography, Stack } from "@mui/material";
import logo from "../images/splash-screen-icon.png";

export default function SplashScreen() {
  return (
    <Box id="splash-screen">
      <Typography variant="h3" id="splash-title">
        The Playlister
      </Typography>

      <img src={logo} alt="Playlister Logo" id="splash-logo" />

      <Stack direction="row">
        <Button variant="contained" id="splash-button">
          Continue as Guest
        </Button>
        <Button variant="contained" id="splash-button">
          Login
        </Button>
        <Button variant="contained" id="splash-button">
          Create Account
        </Button>
      </Stack>
    </Box>
  );
}
