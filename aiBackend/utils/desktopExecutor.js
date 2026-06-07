const axios = require("axios");

async function executeDesktopAction(actionData) {

  const response = await axios.post(
    "http://127.0.0.1:8002/desktop",
    actionData
  );

  return response.data.reply;
}

module.exports = executeDesktopAction;