const axios = require("axios");

async function detectAction(text) {
  try {
    const response = await axios.post(
      "http://127.0.0.1:8001/action",
      { text },
      { timeout: 3000 }
    );

    return response.data.action;
  } catch (error) {
    console.log("Action server not available:", error.message);

    return {
      action: "none",
      target: null,
      confidence: 0
    };
  }
}

module.exports = detectAction;

// const axios = require("axios");

// async function detectAction(text) {
//   const response = await axios.post("http://127.0.0.1:8001/action", {
//     text,
//   });

//   return response.data.action;
// }

// module.exports = detectAction;