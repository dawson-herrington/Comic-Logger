// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Save comic to text file
    saveComicData: (comicData) => ipcRenderer.send('save-comic-data', comicData),

    // Read data into the To-Read list
    getToReadData: () => ipcRenderer.invoke('get-to-read-data'),

    // Read data into the Completed list
    getCompletedData: () => ipcRenderer.invoke('get-completed-data'),

    // Mark comic as complete
    markComicComplete: (comicId, updatedComic) => ipcRenderer.invoke('mark-comic-complete', comicId, updatedComic),

    // deletion
    deleteComic: (index, listType) => ipcRenderer.invoke('delete-comic', index, listType),

    // For infoPage support
    setComicDetails: (comic, listType) => ipcRenderer.invoke('set-comic-details', comic, listType),
    getComicDetails: () => ipcRenderer.invoke('get-comic-details'),

});
