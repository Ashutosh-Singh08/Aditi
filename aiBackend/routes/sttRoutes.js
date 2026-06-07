const express = require("express");
const multer = require("multer");
const fs = require("fs/promises");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
});

router.post("/", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No audio file uploaded",
      });
    }

    const audioBuffer = await fs.readFile(req.file.path);

    const formData = new FormData();

    const audioBlob = new Blob([audioBuffer], {
      type: req.file.mimetype || "audio/webm",
    });

    formData.append("file", audioBlob, req.file.originalname || "audio.webm");
    formData.append("model", process.env.STT_MODEL || "whisper-large-v3-turbo");
    formData.append("language", "en");

    const response = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: formData,
      }
    );

    const data = await response.json();

    await fs.unlink(req.file.path);

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: data,
      });
    }

    return res.status(200).json({
      success: true,
      text: data.text || "",
    });
  } catch (error) {
    console.log("STT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;