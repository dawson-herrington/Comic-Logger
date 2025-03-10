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

        const toReadData = fs.readFileSync(toReadPath, 'utf-8')
            .split('\n')
            .filter(line => line.trim() !== '');

        const remainingComics = toReadData.filter((_, index) => index !== id);

        fs.writeFileSync(toReadPath, remainingComics.join('\n'), 'utf-8');

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
        const filePath = listType === 'toRead' 
            ? path.join(__dirname, 'toRead.txt') 
            : path.join(__dirname, 'completed.txt');

        const data = fs.readFileSync(filePath, 'utf-8');
        const lines = data.split('\n').filter(line => line.trim() !== '');

        const remainingComics = lines.filter((_, comicIndex) => comicIndex !== index);

        fs.writeFileSync(filePath, remainingComics.join('\n'), 'utf-8');

        console.log(`Comic at index ${index} deleted from ${listType} list.`);
    } catch (err) {
        console.error(`Error deleting comic from ${listType} list:`, err);
        throw err;
    }
});

let comicDetails = null;

ipcMain.handle('set-comic-details', (event, comic, listType) => {
    comicDetails = { ...comic, listType };
});

ipcMain.handle('get-comic-details', () => {
    return comicDetails;
});

const REQUEST_FILE = path.join(__dirname, "get_random.txt");
const OUTPUT_FILE = path.join(__dirname, "random_comic.txt");

ipcMain.on("request-random-comic", async (event, requestType) => {
    try {
        fs.writeFileSync(REQUEST_FILE, requestType, "utf-8");
        console.log("Random comic request written:", requestType);
    } catch (err) {
        console.error("Error writing request file:", err);
    }
});

ipcMain.handle("get-random-comic", async () => {
    try {
        if (fs.existsSync(OUTPUT_FILE)) {
            const data = fs.readFileSync(OUTPUT_FILE, "utf-8");
            fs.unlinkSync(OUTPUT_FILE); // Delete file after reading
            return JSON.parse(data);
        }
        return { error: "No random comic found yet. Try again in a few seconds." };
    } catch (err) {
        console.error("Error reading random comic file:", err);
        return { error: "Failed to retrieve random comic." };
    }
});

const EXPORT_REQUEST_FILE = path.join(__dirname, "export_request.txt");

ipcMain.on("request-export", async (event, listType, format) => {
    try {
        const requestData = `${listType} ${format}`;
        fs.writeFileSync(EXPORT_REQUEST_FILE, requestData, "utf-8");
        console.log("Export request written:", requestData);
    } catch (err) {
        console.error("Error writing export request:", err);
    }
});

const SEARCH_REQUEST_FILE = path.join(__dirname, "google_search_request.json");

ipcMain.on("request-google-search", async (event, searchRequest) => {
    try {
        fs.writeFileSync(SEARCH_REQUEST_FILE, JSON.stringify(searchRequest, null, 4), "utf-8");
        console.log("Google search request written:", searchRequest);
    } catch (err) {
        console.error("Error writing Google search request:", err);
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
