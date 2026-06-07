require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { spawn } = require("child_process");

const dbConnect = require("./config/database");

const sttRoutes = require("./routes/sttRoutes");
const chatRoutes = require("./routes/chatRoutes");
const listenRoutes = require("./routes/listenRoutes");
const selfUpdateRoutes = require("./routes/selfUpdateRoutes");

const app = express();

app.use(
  cors({
    origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/audio", express.static(path.join(__dirname, "audio")));

spawn(
  "python",
  [
    "-m",
    "uvicorn",
    "intent_server:app",
    "--host",
    "127.0.0.1",
    "--port",
    "8000",
  ],
  {
    shell: true,
    stdio: "inherit",
  }
);

spawn(
  "python",
  [
    "-m",
    "uvicorn",
    "action_server:app",
    "--host",
    "127.0.0.1",
    "--port",
    "8001",
  ],
  {
    shell: true,
    stdio: "inherit",
  }
);

dbConnect();

app.use("/api/listen", listenRoutes);
app.use("/api/stt", sttRoutes);
app.use("/api/self-update", selfUpdateRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.send("Personal AI Assistant Backend Running");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});