const express = require("express");
const app = express();

app.get("/api", (req, res) => {
  res.json({ mensaje: "Backend funcionando" });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Backend en http://localhost:${PORT}`);
});