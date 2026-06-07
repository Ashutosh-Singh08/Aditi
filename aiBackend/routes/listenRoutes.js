const express = require("express");
const { spawn } = require("child_process");
const path = require("path");

const router = express.Router();

router.get("/", (req, res) => {
  const pyPath = path.join(__dirname, "..", "listen_once.py");

  const py = spawn("python", [pyPath]);

  let output = "";
  let error = "";

  py.stdout.on("data", (data) => {
    output += data.toString();
  });

  py.stderr.on("data", (data) => {
    error += data.toString();
  });

  py.on("close", () => {
    if (error) console.log("Listen error:", error);

    const lines = output.trim().split("\n");
    const finalText = lines[lines.length - 1];

    res.json({
      success: true,
      text: finalText || "",
    });
  });
});

module.exports = router;