const express = require("express");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT;
app.use = express.json();

app.get("/", (req, res) => {
  res.send("Hello from Express with .env!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
