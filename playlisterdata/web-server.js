// web-server.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const buildPath = path.join(__dirname, "..", "playlister", "build");

// Serve static files from the React build
app.use(express.static(buildPath));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});