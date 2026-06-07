const Chat = require("../models/Chat");
const Memory = require("../models/Memory");
const { getEmbedding, cosineSimilarity } = require("../utils/embedding");
const askOnlineModel = require("../utils/onlineModel");
const { exec, spawn } = require("child_process");
const path = require("path");
const persona = require("../config/persona");
const detectIntent = require("../utils/intentDetector");
const detectAction = require("../utils/actionDetector");
const fs = require("fs");
const { execFile } = require("child_process");



let pendingDangerousCommand = null;

const runTTS = (text, fileName) => {
  return new Promise((resolve) => {
    if (!text) return resolve(false);

    const safeText = text.replace(/\n/g, " ");
    const ttsPath = path.join(__dirname, "..", "tts.py");
    const outputPath = path.join(__dirname, "..", "audio", fileName);

    execFile("python", [ttsPath, safeText, outputPath], (error, stdout, stderr) => {
      if (error) {
        console.log("TTS ERROR:", error);
        return resolve(false);
      }

      if (stderr) console.log("TTS STDERR:", stderr);
      if (stdout) console.log("TTS STDOUT:", stdout);

      resolve(fs.existsSync(outputPath));
    });
  });
};

const sendReply = async (res, payload) => {
  let audioUrl = null;

  if (payload.reply) {
    const fileName = `output-${Date.now()}.mp3`;
    const success = await runTTS(payload.reply, fileName);

    if (success) {
      audioUrl = `http://127.0.0.1:4000/audio/${fileName}`;
    }
  }

  return res.status(200).json({
    ...payload,
    audio: audioUrl,
  });
};

const runDesktopController = (actionData, securityCode = "") => {
  return new Promise((resolve) => {
    const pyPath = path.join(__dirname, "..", "desktop_controller.py");

    const py = spawn("python", [
      pyPath,
      actionData.action,
      actionData.target || "",
      securityCode || "",
    ]);

    let output = "";
    let error = "";

    py.stdout.on("data", (data) => {
      output += data.toString();
    });

    py.stderr.on("data", (data) => {
      error += data.toString();
    });

    py.on("close", () => {
      if (error) console.log("Desktop stderr:", error);
      resolve(output.trim() || error.trim() || "Desktop command completed.");
    });
  });
};

const isDangerousAction = (action) => {
  return [
    "shutdown",
    "restart",
    "delete_file",
    "delete_folder",
    "close_all_tabs",
    "close_all_apps",
    "format_drive",
  ].includes(action);
};

const extractDesktopAction = async (message) => {
  const msg = message.toLowerCase().trim();

  if (msg.includes("screenshot")) {
    return { action: "screenshot", target: "" };
  }

  if (msg.includes("picture") || msg.includes("photo") || msg.includes("selfie")) {
    return { action: "take_photo", target: "" };
  }

  if (msg.includes("new tab")) {
    return { action: "new_tab", target: "" };
  }

  if (msg.includes("close tab")) {
    return { action: "close_tab", target: "" };
  }

  if (msg.includes("close window")) {
    return { action: "close_window", target: "" };
  }

  if (msg.includes("shutdown")) {
    return { action: "shutdown", target: "" };
  }

  if (msg.includes("restart")) {
    return { action: "restart", target: "" };
  }

  if (msg.includes("lock")) {
    return { action: "lock", target: "" };
  }

  if (msg.includes("volume up")) {
    return { action: "volume_up", target: "" };
  }

  if (msg.includes("volume down")) {
    return { action: "volume_down", target: "" };
  }

  if (msg.includes("mute")) {
    return { action: "mute", target: "" };
  }

  if (msg.includes("play") && msg.includes("youtube")) {
    const target = msg
      .replace("play", "")
      .replace("on youtube", "")
      .replace("youtube", "")
      .trim();

    return { action: "play_youtube", target };
  }

  if (msg.includes("search") && msg.includes("youtube")) {
    const target = msg
      .replace("search", "")
      .replace("on youtube", "")
      .replace("youtube", "")
      .trim();

    return { action: "search_youtube", target };
  }

  if (
    msg.includes("search") ||
    msg.startsWith("google ") ||
    msg.includes("google")
  ) {
    const target = msg
      .replace("search", "")
      .replace("on google", "")
      .replace("google", "")
      .trim();

    return { action: "search_google", target };
  }

  if (msg.includes("close")) {
    const target = msg.replace("close", "").trim();
    return { action: "close_app", target };
  }

  const apps = [
    "chrome",
    "vscode",
    "vs code",
    "visual studio code",
    "notepad",
    "spotify",
    "whatsapp",
    "telegram",
    "settings",
    "calculator",
    "terminal",
    "file explorer",
    "youtube",
    "github",
    "chatgpt",
  ];

  for (const app of apps) {
    if (msg.includes(app)) {
      return { action: "open_app", target: app };
    }
  }

  return { action: "open_app", target: msg };
};

exports.chatWithAI = async (req, res) => {
  try {
    const { message, securityCode } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    if (pendingDangerousCommand) {
      const userText = message.trim().toLowerCase();

      const cancelWords = [
        "cancel",
        "leave it",
        "stop",
        "forget it",
        "don't do it",
        "dont do it",
        "ignore",
        "no",
      ];

      if (cancelWords.some((word) => userText.includes(word))) {
        pendingDangerousCommand = null;

        return await sendReply(res, {
          success: true,
          reply: "Okay, cancelled the risky command.",
        });
      }

      if (message.trim() !== process.env.SECURITY_CODE.trim()) {
        return await sendReply(res, {
          success: false,
          reply: "Wrong security code. Say cancel if you don’t want to continue.",
          requiresCode: true,
        });
      }

      const actionData = pendingDangerousCommand;
      pendingDangerousCommand = null;

      exec(
        `python desktop_controller.py "${actionData.action}" "${actionData.target || ""}" "${message.trim()}"`,
        (error, stdout, stderr) => {
          if (error) console.log("Desktop error:", error);
          if (stderr) console.log("Desktop stderr:", stderr);
          if (stdout) console.log("Desktop stdout:", stdout);
        }
      );

      return await sendReply(res, {
        success: true,
        reply: "Security code accepted. Executing the command.",
      });
    }

    await Chat.create({
      role: "user",
      message,
    });

    const intent = await detectIntent(message);
    console.log("Intent detected:", intent);

    if (intent === "SELF_UPDATE" || intent === "CODE_UPDATE") {
      const response = await fetch("http://localhost:4000/api/self-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          command: message,
        }),
      });

      const data = await response.json();

      return await sendReply(res, {
        success: data.success,
        reply: data.message,
        intent,
      });
    }
const preAction = await detectAction(message);

if (preAction === "effect_flowers") {
  return await sendReply(res, {
    success: true,
    reply: "for you, i will",
    intent,
    desktopAction: {
      type: "effect",
      effect: "flowers",
    },
  });
}
if (preAction === "effect_cat") {
  return await sendReply(res, {
    success: true,
    reply: "Hii Ashu~ ❤️",
    intent,
    desktopAction: {
      type: "effect",
      effect: "cat",
    },
  });
}
if (preAction === "effect_rescue") {
  return await sendReply(res, {
    success: true,
    reply: " ",
    intent,
    desktopAction: {
      type: "effect",
      effect: "rescue",
    },
  });
}
if (intent === "OPEN_APP" || intent === "COMMAND") {
  const action = await detectAction(message);


  const actionData = {
    action,
    target: message,
  };

  console.log("Desktop action:", actionData);

  if (
    isDangerousAction(actionData.action) &&
    securityCode !== process.env.SECURITY_CODE
  ) {
    pendingDangerousCommand = actionData;

    return await sendReply(res, {
      success: false,
      reply: "This is a risky command. Give me the security code first.",
      requiresCode: true,
      intent,
    });
  }

  const reply = await runDesktopController(actionData, securityCode);

  return await sendReply(res, {
    success: true,
    reply,
    intent,
  });
}

    if (intent === "VOICE_CONTROL") {

  const lowerMsg = message.toLowerCase();

  if (
    lowerMsg.includes("stop listening") ||
    lowerMsg.includes("disable voice") ||
    lowerMsg.includes("mute yourself")
  ) {

    return await sendReply(res, {
      success: true,
      reply: "Okay, I will stop listening for now.",
      intent,
      voiceAction: "STOP_LISTENING",
    });
  }

  if (
    lowerMsg.includes("start listening") ||
    lowerMsg.includes("enable voice") ||
    lowerMsg.includes("wake up")
  ) {

    return await sendReply(res, {
      success: true,
      reply: "I'm listening now.",
      intent,
      voiceAction: "START_LISTENING",
    });
  }

  if (
    lowerMsg.includes("stop talking") ||
    lowerMsg.includes("be quiet")
  ) {

    return await sendReply(res, {
      success: true,
      reply: "Okay.",
      intent,
      voiceAction: "STOP_TTS",
    });
  }

  return await sendReply(res, {
    success: true,
    reply: "Voice control command received.",
    intent,
    voiceAction: "VOICE_CONTROL",
  });
}

    const lowerMessage = message.toLowerCase();

    const importantMemoryKeywords = [
      "remember that",
      "remember i",
      "save that",
      "note that",
      "from now on",
      "my project is",
      "my goal is",
      "i prefer",
      "i am learning",
      "i am working on",
    ];

    const shouldSaveMemory =
      intent === "SELF_UPDATE" ||
      importantMemoryKeywords.some((keyword) => lowerMessage.includes(keyword));

    if (shouldSaveMemory) {
      const memoryEmbedding = await getEmbedding(message);

      await Memory.create({
        text: message,
        category: "important_memory",
        embedding: memoryEmbedding,
      });

      console.log("Important memory saved:", message);
    }

    const questionEmbedding = await getEmbedding(message);

    const allMemories = await Memory.find({
  embedding: { $exists: true, $type: "array", $ne: [] },
});

const validMemories = allMemories.filter(
  (memory) =>
    Array.isArray(memory.embedding) &&
    Array.isArray(questionEmbedding) &&
    memory.embedding.length === questionEmbedding.length
);
const scoredMemories = validMemories
  .map((memory) => ({
    memory,
    score: cosineSimilarity(questionEmbedding, memory.embedding),
  }))
  
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    const memoryText = scoredMemories
      .map((item, index) => `${index + 1}. ${item.memory.text}`)
      .join("\n");

if (intent === "MEMORY_SEARCH") {
  const memoryPrompt = `
You are ${persona.assistantName}, ${persona.userName}'s personal AI companion.

The user asked:
${message}

Relevant saved memories:
${memoryText || "No relevant memories found."}

Reply naturally. Do not list raw memories unless the user specifically asks for a list.
Give a short helpful answer based on the memories.
`;

  let memoryReply = "";

  if (process.env.USE_ONLINE_MODEL === "true") {
    memoryReply = await askOnlineModel(memoryPrompt);
  } else {
    const response = await fetch(process.env.OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL,
        prompt: memoryPrompt,
        stream: false,
        think: false,
      }),
    });

    const data = await response.json();
    memoryReply =
      data.response || "I found something, but couldn't explain it properly.";
  }

  return await sendReply(res, {
    success: true,
    reply: memoryReply,
    intent,
  });
}

    const recentChats = await Chat.find().sort({ createdAt: -1 }).limit(8);

    const conversationText = recentChats
      .reverse()
      .map((chat) =>
        `${chat.role === "user" ? "Ashutosh" : "Aditi"}: ${chat.message}`
      )
      .join("\n");

    const prompt = `
You are ${persona.assistantName}, ${persona.userName}'s personal AI companion.

Current intent:
${intent}

Personality:
${persona.personality}

Saved memories:
${memoryText || "No memories yet."}

Recent conversation:
${conversationText || "No recent conversation."}

${persona.userName}: ${message}
${persona.assistantName}:
`;

    let aiReply = "";

    try {
      if (process.env.USE_ONLINE_MODEL === "true") {
        console.log("Using ONLINE model:", process.env.ONLINE_MODEL);
        aiReply = await askOnlineModel(prompt);
      } else {
        console.log("Using LOCAL fallback model:", process.env.OLLAMA_MODEL);

        const response = await fetch(process.env.OLLAMA_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: process.env.OLLAMA_MODEL,
            prompt,
            stream: false,
            think: false,
            options: {
              num_predict: 180,
              temperature: 0.85,
              repeat_penalty: 1.25,
              top_p: 0.9,
            },
          }),
        });

        const data = await response.json();
        aiReply = data.response || data.error || "No response from local AI";
      }
    } catch (error) {
      console.log("Online model failed. Using local fallback.");

      const response = await fetch(process.env.OLLAMA_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL,
          prompt,
          stream: false,
          think: false,
        }),
      });

      const data = await response.json();
      aiReply = data.response || data.error || "No response from fallback AI";
    }

    await Chat.create({
      role: "assistant",
      message: aiReply,
    });

    return await sendReply(res, {
      success: true,
      reply: aiReply,
      intent,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const chats = await Chat.find().sort({ createdAt: 1 }).limit(50);

    return res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
  console.log("CHAT CONTROLLER ERROR:", error.message);
  console.log(error.stack);

  return res.status(500).json({
    success: false,
    message: error.message,
  });
}
};
