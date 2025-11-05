// THESE ARE NODE APIs WE WISH TO USE
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

// CREATE OUR SERVER
dotenv.config();
const PORT = process.env.PORT || 4000;
const app = express();

// SETUP THE MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// SETUP OUR OWN ROUTERS AS MIDDLEWARE
const authRouter = require("./routes/auth-router");
app.use("/auth", authRouter);
const storeRouter = require("./routes/store-router");
app.use("/store", storeRouter);

// INITIALIZE OUR DATABASE OBJECT (CHECK FOR CONNECTION TOO)
const db = require("./db");
if (process.env.DB_TYPE === "mongodb") {
  db.on("error", console.error.bind(console, "Database connection error:"));
} else if (process.env.DB_TYPE === "postgresql") {
  db.authenticate().catch((err) => {
    console.error("Database connection error:", err);
  });
} else {
  throw new Error("Unsupported DB_TYPE in .env file: " + process.env.DB_TYPE);
}

// PUT THE SERVER IN LISTENING MODE
app.listen(PORT, () =>
  console.log(`Playlister Server running on port ${PORT}`)
);
