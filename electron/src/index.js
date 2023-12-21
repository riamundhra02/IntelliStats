const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const menuFuncs = require('./ElectronFunctions/menu')
const fs = require('fs');

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
    win.loadURL('http://localhost:3000'); // <--- (3) Loading react


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

                // Creating and Writing to the sample.txt file 
                fs.writeFile(file.filePath.toString(),
                    JSON.stringify(m), function (err) {
                        if (err) throw err;
                    });
            }
        }).catch(err => {
            console.log(err)
        })
    })
    win.webContents.openDevTools()
    win.webContents.on('did-finish-load', () => { win.webContents.send('ping', 'ping') });
    win.on('closed', () => {
        win = null
    });

};
app.on('ready', createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
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
        submenu: [
            {
                label: 'Open Project',
            },
            {
                label: 'Import Data',
                click: () => { menuFuncs.importFunction(win) }
            },
            {
                label: 'Export',
                submenu: [
                    {
                        label: 'Export Data',
                        submenu: [
                            {
                                label: '.xlsx',
                                click: () => { menuFuncs.exportDataFunctionXLSX(win) }
                            },
                            {
                                label: '.csv',
                                click: () => { menuFuncs.exportDataFunctionCSV(win) },
                            }
                        ]

                    },
                    {
                        label: 'Export Page',
                        click: () => { menuFuncs.exportPDF(win) }
                    }
                ]
            },
            {
                label: 'Save',
                submenu: [
                    {
                        label: 'Save Project',
                        click: () => { menuFuncs.saveProject(win)}
                    },
                    {
                        label: 'Save as Template',
                        click: () => { menuFuncs.saveAsTemplate(win) }
                    }
                ]
            },
            isMac ? { role: 'close' } : { role: 'quit' }
        ]
    },
    {
        label: 'Insert',
        submenu: [
            {
                label: "From Template",
                click: () => { menuFuncs.importTemplate(win) }
            },
            {
                label: "Regression Model",
                click: () => { menuFuncs.regression(win, __dirname) }
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
