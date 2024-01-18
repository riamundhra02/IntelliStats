const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const menuFuncs = require('./ElectronFunctions/menu')
const fs = require('fs');
const xlsx = require('xlsx');

let win;
function createWindow() {
    win = new BrowserWindow({
        width: 800, height: 600, transparent: false,
        webPreferences: { // <--- (1) Additional preferences
            nodeIntegration: false,
            contextIsolation: false,
            preload: __dirname + '/preload.js' // <--- (2) Preload script
        }
    });
    if (process.env.NODE_ENV === 'dev') {
        win.loadURL('http://localhost:3000')
        win.webContents.openDevTools()
      } else {
     win.loadURL(`file://${process.resourcesPath}/build/html/index.html`)
      }


    ipcMain.on('saveTemplate', (event, m) => {
        dialog.showSaveDialog({
            title: 'Select File Path',
            buttonLabel: 'Save',
            filters: [
                {
                    name: `${m.save} Files`,
                    extensions: [m.save]
                },],
            properties: []
        }).then(file => {
            if (!file.canceled) {

                fs.writeFile(file.filePath.toString(),
                    JSON.stringify(m), function (err) {
                        if (err) throw err;
                    });
            }
        }).catch(err => {
            console.log(err)
        })
    })

    ipcMain.on('test_export', (event, m) => {
        dialog.showSaveDialog({
            title: 'Select File Path',
            buttonLabel: 'Save',
            filters: [
                {
                    name: `${m.save} Files`,
                    extensions: [m.save]
                },],
            properties: []
        }).then(async (file) => {
            if (!file.canceled) {

                const wb = xlsx.read(m.data)
                // console.log(wb)
                xlsx.writeFile(wb, file.filePath, {type: m.save})
            }
        }).catch(err => {
            console.log(err)
        })
    })
    win.webContents.on('did-finish-load', () => { win.webContents.send('ping', 'ping') });
    win.on('closed', () => {
        ipcMain.removeAllListeners('saveTemplate')
        ipcMain.removeAllListeners('test_export')
        win = null
    });

};
app.on('ready', createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        ipcMain.removeAllListeners('saveTemplate')
        ipcMain.removeAllListeners('test_export')
        app.quit()
    }
});
app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
});

const isMac = process.platform === 'darwin'

const template = [
    ...(isMac
        ? [{
            label: app.name,
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        }]
        : []),
    // { role: 'fileMenu' }
    {
        label: 'File',
        id: 'File',
        submenu: [
            {
                label: 'Open Project',
                id: 'Open Project',
                click: () => { menuFuncs.openProject(win) }
            },
            {
                label: 'Import Data',
                id: 'Import Data',
                click: async () => { await menuFuncs.importFunction(win, null) }
            },
            {
                label: 'Export',
                id: 'Export',
                submenu: [
                    {
                        label: 'Export Data',
                        id: 'Export Data',
                        submenu: [
                            {
                                label: '.xlsx',
                                id: '.xlsx',
                                click: () => { menuFuncs.exportDataFunctionXLSX(win) }
                            },
                            {
                                label: '.csv',
                                id: '.csv',
                                click: () => { menuFuncs.exportDataFunctionCSV(win) },
                            }
                        ]

                    },
                    {
                        label: 'Export Page',
                        id: 'Export Page',
                        click: () => { menuFuncs.exportPDF(win) }
                    }
                ]
            },
            {
                label: 'Save',
                id: 'Save',
                submenu: [
                    {
                        label: 'Save Project',
                        id: 'Save Project',
                        click: () => { menuFuncs.saveProject(win) }
                    },
                    {
                        label: 'Save as Template',
                        id: 'Save as Template',
                        click: () => { menuFuncs.saveAsTemplate(win) }
                    }
                ]
            },
            isMac ? { role: 'close' } : { role: 'quit' }
        ]
    },
    {
        label: 'Insert',
        id: 'Insert',
        submenu: [
            {
                label: "From Template",
                id: "From Template",
                click: () => { menuFuncs.importTemplate(win) }
            },
            {
                label: "Regression Model",
                id: "Regression Model",
                click: () => { menuFuncs.regression(win, __dirname) }
            },
            {
                label: "Network Graph",
                id: "Network Graph",
                click: () => { menuFuncs.networkGraph(win, __dirname) }
            },
        ]
    },
    {
        label: 'Edit',
        submenu: [
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            ...(isMac
                ? [
                    { role: 'pasteAndMatchStyle' },
                    { role: 'delete' },
                    { role: 'selectAll' },
                ]
                : [
                    { role: 'delete' },
                    { type: 'separator' },
                    { role: 'selectAll' }
                ])
        ]
    },
    // { role: 'viewMenu' }
    {
        label: 'View',
        submenu: [
            { role: 'resetZoom' },
            { role: 'zoomIn' },
            { role: 'zoomOut' },
            { type: 'separator' },
            { role: 'togglefullscreen' }
        ]
    },
    // { role: 'windowMenu' }
    {
        label: 'Window',
        submenu: [
            { role: 'minimize' },
            { role: 'zoom' },
            ...(isMac
                ? [
                    { type: 'separator' },
                    { role: 'front' },
                    { type: 'separator' },
                    { role: 'window' }
                ]
                : [
                    { role: 'close' }
                ])
        ]
    },
    {
        role: 'help',
        submenu: [
            {
                label: 'Learn More',
                click: async () => {
                    const { shell } = require('electron')
                    await shell.openExternal('https://electronjs.org')
                }
            }
        ]
    }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
