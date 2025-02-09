const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('node:path');

// IPC handlers
ipcMain.handle('get-completed-data', async () => {
    const filePath = path.join(__dirname, 'completed.txt');
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        const lines = data.split('\n').filter(line => line.trim() !== '');
        return lines.map(line => JSON.parse(line));
    } catch (err) {
        console.error('Error reading completed.txt:', err);
        return [];
    }
});

ipcMain.handle('get-to-read-data', async () => {
    const filePath = path.join(__dirname, 'toRead.txt');
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        const lines = data.split('\n').filter(line => line.trim() !== '');
        return lines.map(line => JSON.parse(line));
    } catch (err) {
        console.error('Error reading toRead.txt:', err);
        return [];
    }
});

ipcMain.handle('mark-comic-complete', async (event, comicId, updatedComic) => {
    const toReadPath = path.join(__dirname, 'toRead.txt');
    const completedPath = path.join(__dirname, 'completed.txt');

    try {
        const id = parseInt(comicId, 10);

        // Step 1: Read and filter toRead.txt to remove the marked comic
        const toReadData = fs.readFileSync(toReadPath, 'utf-8')
            .split('\n')
            .filter(line => line.trim() !== '');

        const remainingComics = toReadData.filter((_, index) => index !== id);

        // Step 2: Write the remaining comics back to toRead.txt
        fs.writeFileSync(toReadPath, remainingComics.join('\n'), 'utf-8');

        // Step 3: Append the updated comic to completed.txt
        const updatedComicString = JSON.stringify(updatedComic) + '\n';
        fs.appendFileSync(completedPath, updatedComicString, 'utf-8');

        console.log('Comic marked as complete:', updatedComic);
    } catch (err) {
        console.error('Error marking comic as complete:', err);
        throw err;
    }
});

ipcMain.on('save-comic-data', (event, comicData) => {
    const filePath = comicData.list === 'readList' 
        ? path.join(__dirname, 'toRead.txt') 
        : path.join(__dirname, 'completed.txt');

    const jsonData = JSON.stringify(comicData) + '\n';

    fs.appendFile(filePath, jsonData, (err) => {
        if (err) {
            console.error('Error saving comic data:', err);
        } else {
            console.log('Comic data saved to:', filePath, comicData);
        }
    });
});

ipcMain.handle('delete-comic', async (event, index, listType) => {
    try {
        // Determine the file path based on the list type
        const filePath = listType === 'toRead' 
            ? path.join(__dirname, 'toRead.txt') 
            : path.join(__dirname, 'completed.txt');

        // Read the file and parse JSON lines
        const data = fs.readFileSync(filePath, 'utf-8');
        const lines = data.split('\n').filter(line => line.trim() !== '');

        // Remove the comic at the specified index
        const remainingComics = lines.filter((_, comicIndex) => comicIndex !== index);

        // Write the remaining comics back to the file
        fs.writeFileSync(filePath, remainingComics.join('\n'), 'utf-8');

        console.log(`Comic at index ${index} deleted from ${listType} list.`);
    } catch (err) {
        console.error(`Error deleting comic from ${listType} list:`, err);
        throw err;
    }
});


function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
