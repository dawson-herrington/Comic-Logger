const { contextBridge, ipcRenderer } = require('electron');


window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
  
    for (const type of ['chrome', 'node', 'electron']) {
      replaceText(`${type}-version`, process.versions[type])
    }
  })

// hook front to back
contextBridge.exposeInMainWorld('electronAPI', {
  saveComicData: (comicData) => ipcRenderer.send('save-comic-data', comicData),
});