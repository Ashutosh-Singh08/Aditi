const { app, BrowserWindow, session,ipcMain,screen } = require("electron");
const path = require("path");


let win;
let flowerWindow = null;
let catWindow = null;
let rescueWindow = null;
function createWindow() {
  const { width } = screen.getPrimaryDisplay().workAreaSize;

win = new BrowserWindow({
 width: 600,
height: 105,
x: width - 710,
y: 30,

  frame: false,
  transparent: true,
  backgroundColor: "#00000000",

  resizable: false,
  hasShadow: false,
  thickFrame: false,

  movable: true,
  skipTaskbar: true,

  webPreferences: {
    preload: path.join(__dirname, "preload.js"),
    contextIsolation: true,
    nodeIntegration: false,
  },
});

  win.setBackgroundColor("#00000000");
  win.setMenuBarVisibility(false);

  session.defaultSession.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      console.log("Permission requested:", permission);

      if (permission === "media" || permission === "microphone") {
        callback(true);
      } else {
        callback(false);
      }
    }
  );

  win.loadURL("http://127.0.0.1:5173");
win.webContents.once("did-finish-load", () => {
  const w = 950;
  const h = 155;
  const radius = 78;

  const shape = [];

  for (let y = 0; y < h; y++) {
    let x = 0;
    let rowWidth = w;

    if (y < radius) {
      const dy = radius - y;
      x = Math.floor(radius - Math.sqrt(radius * radius - dy * dy));
      rowWidth = w - x * 2;
    } else if (y > h - radius) {
      const dy = y - (h - radius);
      x = Math.floor(radius - Math.sqrt(radius * radius - dy * dy));
      rowWidth = w - x * 2;
    }

    shape.push({
      x,
      y,
      width: rowWidth,
      height: 1,
    });
  }

  win.setShape(shape);
});
//  win.webContents.openDevTools({ mode: "detach" });
}
function showRescueEffect() {
  if (rescueWindow) {
    rescueWindow.close();
    rescueWindow = null;
  }

  const display = screen.getPrimaryDisplay();
  const { width, height } = display.bounds;

  rescueWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
   
    resizable: false,
    focusable: false,
    backgroundColor: "#00000000",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  rescueWindow.setIgnoreMouseEvents(true);

  rescueWindow.loadFile(
    path.join(__dirname, "effects", "rescue", "rescue.html")
  );

  rescueWindow.on("closed", () => {
    rescueWindow = null;
  });
}

ipcMain.on("show-rescue-effect", () => {
  showRescueEffect();
});

function showCat() {
  if (catWindow) {
    catWindow.close();
    catWindow = null;
  }

  const display = screen.getPrimaryDisplay();
  const { width, height } = display.bounds;

  catWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
  
    resizable: false,
    focusable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  catWindow.setIgnoreMouseEvents(true);
  console.log("CAT WINDOW SIZE:", width, height);

  catWindow.loadFile(
    path.join(__dirname, "effects", "cat", "cat.html")
  );
  catWindow.webContents.once("did-finish-load", () => {
  catWindow.webContents.executeJavaScript(`
    const sound = document.getElementById("catSound");
    if (sound) {
      sound.volume = 0.6;
      sound.currentTime = 0;
      sound.play().catch(err => console.log("Cat sound blocked:", err));
    }
  `);
});

  catWindow.on("closed", () => {
    catWindow = null;
  });

  setTimeout(() => {
    if (catWindow) {
      catWindow.close();
      catWindow = null;
    }
  }, 9000);
}
function showFlowerEffect() {
  if (flowerWindow) {
    flowerWindow.close();
    flowerWindow = null;
  }

  const display = screen.getPrimaryDisplay();
  const { width, height } = display.bounds;

  flowerWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    focusable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  flowerWindow.setIgnoreMouseEvents(true);

  flowerWindow.loadFile(
    path.join(__dirname, "effects", "flowers", "flower.html")
  );

  flowerWindow.on("closed", () => {
    flowerWindow = null;
  });

  setTimeout(() => {
    if (flowerWindow) {
      flowerWindow.close();
      flowerWindow = null;
    }
  }, 9000);
}
ipcMain.on("show-flower-effect", () => {
  showFlowerEffect();
});
ipcMain.on("show-cat", () => {
  showCat();
});
// ipcMain.on("resize-aditi-window", (event, { width, height }) => {
//   if (!win) return;

//   win.setBounds({
//     width: Math.max(550, Math.round(width)),
//     height: Math.max(130, Math.round(height)),
//   });
// });
app.whenReady().then(createWindow);