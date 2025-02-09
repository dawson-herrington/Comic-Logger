const { ipcMain } = require('electron');
const { app, BrowserWindow } = require('electron/main')
const fs = require('fs');
const path = require('node:path')

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  //win.maximize()
  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// a listener for when we save a new comic

ipcMain.on('save-comic-data', (event, comicData) => {
  // is the comic going to the read list or the completed list?
  const fileName = comicData.list === 'readList' ? 'toRead.txt' : 'completed.txt';
  const filePath = path.join(__dirname, fileName);

  // Change JSON to string and format as needed
  const jsonData = JSON.stringify(comicData) + '\n';

  // write to file
  fs.appendFile(filePath, jsonData, (err) => {
      if (err) {
          console.error('Error saving data:', err);
      } else {
          console.log(`Data saved to ${fileName}:`, jsonData);
      }
  });
});

// listener to get data and populate the to-read list
ipcMain.handle('get-to-read-data', async () => {
  const filePath = path.join(__dirname, 'toRead.txt');

  // Read the file and format JSON lines
  try {
      const data = fs.readFileSync(filePath, 'utf-8');
      const lines = data.split('\n').filter(line => line.trim() !== '');
      return lines.map(line => JSON.parse(line)); 
  } catch (err) {
      console.error('Error reading toRead.txt:', err);
      return []; 
  }
});