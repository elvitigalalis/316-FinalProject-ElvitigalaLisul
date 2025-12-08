import { useContext, useState, useRef, useEffect } from "react";
import AuthContext from "../auth";
import MUIErrorModal from "./MUIErrorModal";
import Copyright from "./Copyright";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { useHistory } from "react-router-dom";

export default function EditUserScreen() {
  const { auth } = useContext(AuthContext);

  const [userInfo, setUserInfo] = useState({
    username: "",
    email: "",
    profilePicture: "",
  });

  const [imgSrc, setImgSrc] = useState(
    auth.user ? auth.user.profilePicture : ""
  );
  const fileInputRef = useRef(null);
  const history = useHistory();

  useEffect(() => {
    if (auth.user) {
      setUserInfo({
        username: auth.user.username,
        email: auth.user.email,
      });
      setImgSrc(auth.user.profilePicture);
    }
  }, [auth.user]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    auth.editUser(
      formData.get("username"),
      formData.get("email"),
      formData.get("password"),
      formData.get("passwordVerify"),
      imgSrc
    );
  };

  const handleCancel = () => {
    history.push("/");
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("File size too large! Please select a smaller image.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          if (img.width !== 250 || img.height !== 250) {
            alert("Image dimensions must be 250x250 pixels.");
            return;
          }

          setImgSrc(reader.result);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectClick = () => {
    fileInputRef.current.click();
  };

  const handleInputChange = (prop) => (event) => {
    setUserInfo({ ...userInfo, [prop]: event.target.value });
  };

  if (!auth.user) {
    console.log("Loading for edit screen");
  }

  let modalJSX = "";
  console.log(auth);
  if (auth.errorMessage !== null) {
    modalJSX = <MUIErrorModal />;
  }
  console.log(modalJSX);

  return (
    <Container component="main" maxWidth="md">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <LockOutlinedIcon sx={{ marginBottom: 1, fontSize: 30 }} />

        <Typography component="h1" variant="h5">
          Edit Account
        </Typography>
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={0} alignItems="center">
            <Grid
              item
              xs={2}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: 35,
              }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  bgcolor: "grey.300",
                  borderRadius: "50%",
                  backgroundImage: "url(" + imgSrc + ")",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></Box>

              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={handleFileSelect}
              />

              <Button
                variant="contained"
                size="small"
                onClick={handleSelectClick}
                sx={{ mt: 1, fontSize: "10px", minWidth: "auto" }}
              >
                Select
              </Button>
            </Grid>
            <Grid item xs={8}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="username"
                    label="Username"
                    name="username"
                    autoComplete="username"
                    value={userInfo.username}
                    onChange={handleInputChange("username")}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email"
                    name="email"
                    autoComplete="email"
                    value={userInfo.email}
                    onChange={handleInputChange("email")}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="passwordVerify"
                    label="Password Confirm"
                    type="password"
                    id="passwordVerify"
                    autoComplete="new-password"
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: "flex", gap: 2, mt: 3, mb: 2 }}>
                <Button type="submit" fullWidth variant="contained">
                  Complete
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleCancel}
                  sx={{
                    bgcolor: "grey.500",
                    "&:hover": { bgcolor: "grey.700" },
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
          <Grid item xs={2}></Grid>
        </Box>
      </Box>
      <Copyright sx={{ mt: 5 }} />
      {modalJSX}
    </Container>
  );
}
