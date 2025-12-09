import React, { useContext } from "react";
import { Box, Button, Typography, Stack } from "@mui/material";
import logo from "../images/splash-screen-icon.png";
import { Link } from "react-router-dom";
import AuthContext from "../auth";

export default function SplashScreen() {
  const { auth } = useContext(AuthContext);

  const handleGuestLogin = () => {
    auth.loginGuest();
  };

  return (
    <Box id="splash-screen">
      <Typography variant="h3" id="splash-title">
        The Playlister
      </Typography>

      <img src={logo} alt="Playlister Logo" id="splash-logo" />

      <Stack direction="row">
        <Button
          variant="contained"
          id="splash-button"
          component={Link}
          to="/"
          onClick={handleGuestLogin}
        >
          Continue as Guest
        </Button>
        <Button
          variant="contained"
          id="splash-button"
          component={Link}
          to="/login"
        >
          Login
        </Button>
        <Button
          variant="contained"
          id="splash-button"
          component={Link}
          to="/register"
        >
          Create Account
        </Button>
      </Stack>
    </Box>
  );
}
