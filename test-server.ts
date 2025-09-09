import express from "express";

const app = express();
const PORT = 5000;

app.get("/", (req, res) => {
  res.send("Hello from test server ✅");
});

app.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
});
