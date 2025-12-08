const auth = require("../auth");
const bcrypt = require("bcryptjs");
const db = require("../db");
const { editUser } = require("../../client/src/auth/requests");

getLoggedIn = async (req, res) => {
  try {
    let userId = auth.verifyUser(req);
    if (!userId) {
      return res.status(200).json({
        loggedIn: false,
        user: null,
        errorMessage: "?",
      });
    }

    const loggedInUser = await db.getUserById(userId);
    console.log("loggedInUser: " + loggedInUser);

    return res.status(200).json({
      loggedIn: true,
      user: {
        username: loggedInUser.username,
        email: loggedInUser.email,
      },
    });
  } catch (err) {
    console.log("err: " + err);
    res.json(false);
  }
};

loginUser = async (req, res) => {
  console.log("loginUser");
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ errorMessage: "Please enter all required fields." });
    }

    const existingUser = await db.getUserByEmail(email);
    console.log("existingUser: " + existingUser);
    if (!existingUser) {
      return res.status(401).json({
        errorMessage: "Wrong email or password provided.",
      });
    }

    console.log("provided password: " + password);
    const passwordCorrect = await bcrypt.compare(
      password,
      existingUser.passwordHash
    );
    if (!passwordCorrect) {
      console.log("Incorrect password");
      return res.status(401).json({
        errorMessage: "Wrong email or password provided.",
      });
    }

    // LOGIN THE USER
    const token = auth.signToken(existingUser._id || existingUser.id);
    console.log(token);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: true,
      })
      .status(200)
      .json({
        success: true,
        user: {
          username: existingUser.username,
          email: existingUser.email,
        },
      });
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
};

logoutUser = async (req, res) => {
  res
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: true,
      sameSite: "none",
    })
    .send();
};

registerUser = async (req, res) => {
  console.log("REGISTERING USER IN BACKEND");
  try {
    const { username, email, password, passwordVerify, profilePicture } =
      req.body;
    console.log(
      "create user: " +
        username +
        " " +
        email +
        " " +
        password +
        " " +
        passwordVerify +
        " " +
        profilePicture
    );
    if (!username || !email || !password || !passwordVerify) {
      return res
        .status(400)
        .json({ errorMessage: "Please enter all required fields." });
    }
    console.log("all fields provided");
    if (password.length < 8) {
      return res.status(400).json({
        errorMessage: "Please enter a password of at least 8 characters.",
      });
    }
    console.log("password long enough");
    if (password !== passwordVerify) {
      return res.status(400).json({
        errorMessage: "Please enter the same password twice.",
      });
    }
    console.log("password and password verify match");
    const existingUser = await db.getUserByEmail(email);
    console.log("existingUser: " + existingUser);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        errorMessage: "An account with this email address already exists.",
      });
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);
    console.log("passwordHash: " + passwordHash);

    const newUser = await db.createUser({
      username,
      email,
      passwordHash,
      profilePicture,
    });
    // console.log("new user saved: " + newUser._id || newUser.id);

    // LOGIN THE USER
    const token = auth.signToken(newUser._id || newUser.id);
    console.log("token:" + token);

    await res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
      .status(200)
      .json({
        success: true,
        user: {
          username: newUser.username,
          email: newUser.email,
        },
      });

    console.log("token sent");
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }

  editUser = async (req, res) => {
    try {
      const userId = auth.verifyUser(req);
      if (!userId) {
        return res.status(401).json({
          errorMessage: "You must be logged in to edit your profile.",
        });
      }

      const { username, email, password, passwordVerify, profilePicture } =
        req.body;

      if (!username || !email) {
        return res.status(400).json({
          errorMessage:
            "Please enter all required fields (username and email).",
        });
      }

      const existingUser = await db.getUserByEmail(email);
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(400).json({
          errorMessage: "An account with this email address already exists.",
        });
      }

      let passwordHash;
      if (password && password.length > 0) {
        if (password.length < 8) {
          return res.status(400).json({
            errorMessage: "Please enter a password of at least 8 characters.",
          });
        }
        if (password !== passwordVerify) {
          return res.status(400).json({
            errorMessage: "Please enter the same password twice.",
          });
        }
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        passwordHash = await bcrypt.hash(password, salt);
      }

      const user = await db.getUserById(userId);
      user.username = username;
      user.email = email;
      user.profilePicture = profilePicture;

      if (passwordHash) {
        user.passwordHash = passwordHash;
      }

      await user.save();

      return res.status(200).json({
        success: true,
        user: {
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).send();
    }
  };
};

module.exports = {
  getLoggedIn,
  registerUser,
  loginUser,
  logoutUser,
  editUser,
};
