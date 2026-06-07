const axios = require("axios");

async function detectIntent(message) {
  try {

    const res = await axios.post(
      process.env.INTENT_API_URL,
      {
        text: message,
      }
    );

    console.log("Intent API:", res.data);

    return res.data.intent || "CHAT";

 } catch (error) {
  console.log("Intent detection failed:", error.message);

  if (error.response) {
    console.log("Status:", error.response.status);
    console.log("Data:", error.response.data);
  }

  return "CHAT";
}
}

module.exports = detectIntent;