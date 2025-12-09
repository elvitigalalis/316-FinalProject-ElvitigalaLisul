import { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AuthContext from "../auth";
import { GlobalStoreContext } from "../store";

import EditToolbar from "./EditToolbar";

import AccountCircle from "@mui/icons-material/AccountCircle";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

export default function AppBanner() {
  const { auth } = useContext(AuthContext);
  const { store } = useContext(GlobalStoreContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const location = useLocation();

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    auth.logoutUser();
  };

  const handleGuestLogout = () => {
    handleMenuClose();
    auth.logoutUser();
  };

  const handleHouseClick = () => {
    store.closeCurrentList();
  };

  const isGuest = auth.user && auth.user.email === "GUEST@GUEST.com";

  const menuId = "primary-search-account-menu";
  const loggedOutMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>
        <Link to="/login/">Login</Link>
      </MenuItem>
      <MenuItem onClick={handleMenuClose}>
        <Link to="/register/">Create Account</Link>
      </MenuItem>
    </Menu>
  );

  const guestMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleGuestLogout}>
        <Link to="/login/">Login</Link>
      </MenuItem>
      <MenuItem onClick={handleGuestLogout}>
        <Link to="/register/">Create Account</Link>
      </MenuItem>
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
    </Menu>
  );

  const loggedInMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>
        <Link to="/account/">Edit Account</Link>
      </MenuItem>
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
    </Menu>
  );

  let editToolbar = "";
  let menu = loggedOutMenu;
  if (auth.loggedIn) {
    menu = isGuest ? guestMenu : loggedInMenu;
    if (store.currentList) {
      editToolbar = <EditToolbar />;
    }
  }

  function getAccountMenu(loggedIn) {
    let userInitials = auth.getUserInitials();
    console.log("userInitials: " + userInitials);

    if (loggedIn) {
      if (auth.user && auth.user.profilePicture) {
        return (
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              backgroundImage: "url(" + auth.user.profilePicture + ")",
              backgroundSize: "cover",
              backgroundPosition: "center",
              border: "1px solid white",
            }}
          />
        );
      }

      if (!auth.user) {
        console.log("NO USER LOADED");
        console.log(auth.user);
      }
      if (!auth.user.profilePicture) {
        console.log("NO PROFILE PICTURE");
      }

      return <div>{userInitials}</div>;
    } else return <AccountCircle sx={{ width: 50, height: 50 }} />;
  }

  const showPlaylisterNavBar =
    auth.loggedIn && location.pathname !== "/account/";

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h4"
            noWrap
            component="div"
            sx={{
              display: { xs: "none", sm: "block" },
              fontSize: "h2.fontSize",
            }}
          >
            <Link
              onClick={handleHouseClick}
              style={{ textDecoration: "none", color: "white" }}
              to="/"
            >
              ⌂
            </Link>
          </Typography>

          {showPlaylisterNavBar && (
            <Box sx={{ display: "flex", gap: 2, ml: 4 }}>
              <Button
                component={Link}
                to="/"
                sx={{
                  color: "white",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  backgroundColor: "var(--swatch-accent)",
                }}
              >
                Playlists
              </Button>
              <Button
                component={Link}
                to="/songs/"
                sx={{
                  color: "white",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  backgroundColor: "var(--swatch-accent)",
                }}
              >
                Song Catalog
              </Button>
            </Box>
          )}

          {showPlaylisterNavBar && (
            <Box
              sx={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              <Typography variant="h4" component="div" sx={{ color: "white" }}>
                The Playlister
              </Typography>
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }}>{editToolbar}</Box>
          <Box sx={{ height: "90px", display: { xs: "none", md: "flex" } }}>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              {getAccountMenu(auth.loggedIn)}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {menu}
    </Box>
  );
}
