const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  showFlowerEffect: () => ipcRenderer.send("show-flower-effect"),
  showCat: () => ipcRenderer.send("show-cat"),
  showRescueEffect: () => ipcRenderer.send("show-rescue-effect"),
//  resizeAditiWindow: (size) =>
//   ipcRenderer.send("resize-aditi-window", size),

});
