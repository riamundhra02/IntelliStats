const { app, BrowserWindow, Menu, dialog } = require('electron');
const fs = require('fs');
const path = require('path')
const papaparse = require('papaparse')
const xlsx = require('xlsx')

let d = 0
async function importFunction(win, file) {
    let fileName = file;
    if (!file) {
        fileName = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{
                name: 'Data',
                extensions: ['csv', 'xlsx']
            }]
        })
    }
    if (fileName.canceled || fileName === undefined) {
        console.log("No file selected");
        return;
    }

    const wb = xlsx.readFile(fileName.filePaths[0], { type: fileName.filePaths[0].split('.').pop() });
    const wsname = wb.SheetNames[0];
    const ws = wb.Sheets[wsname];
    const data = xlsx.utils.sheet_to_json(ws);
    if (!file) {
        win?.webContents.send('Import', { data: data, idx: d++ })
    } else {
        return data
    }

}

function exportDataFunctionXLSX(win) {
    win.webContents.send('ExportData', process.env.mode == 'test' ? "test_xlsx" : 'xlsx')
}

function exportDataFunctionCSV(win) {
    win.webContents.send('ExportData', process.env.mode == 'test' ? "test_csv" : 'csv')
}

let v = 0;
function regression(win) {
    win.webContents.send('Regression', v)
    // let popupWindow = new BrowserWindow({
    //     frame: true,
    //     focusable: false,
    //     alwaysOnTop: true,
    //     skipTaskbar: true,
    //     height: 300,
    //     width: 400,
    //     webPreferences: {
    //         nodeIntegration: false,
    //         contextIsolation: false,
    //         preload: path.join(dirname, "/preload.js") // Do I need this? Yes
    //     }
    // });

    // Menu.setApplicationMenu(null);
    // popupWindow.webContents.openDevTools()
    // popupWindow.loadURL(`http://localhost:3000/regression`);
    v += 1

}

function networkGraph(win) {
    win.webContents.send('Network Graph', v)
    // let popupWindow = new BrowserWindow({
    //     frame: true,
    //     focusable: false,
    //     alwaysOnTop: true,
    //     skipTaskbar: true,
    //     height: 300,
    //     width: 400,
    //     webPreferences: {
    //         nodeIntegration: false,
    //         contextIsolation: false,
    //         preload: path.join(dirname, "/preload.js") // Do I need this? Yes
    //     }
    // });

    // Menu.setApplicationMenu(null);
    // popupWindow.webContents.openDevTools()
    // popupWindow.loadURL(`http://localhost:3000/regression`);
    v += 1

}

function saveAsTemplate(win) {
    win.webContents.send('SaveAsTemplate', "SaveAsTemplate")
}

function saveProject(win) {

    win.webContents.send('SaveProject', "SaveProject")
}

function exportPDF(win) {
    win.webContents.send('exportPDF', "exportPDF")
}

function importTemplate(win) {
    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{
            name: 'Template',
            extensions: ['template']
        }]
    }).then((fileName) => {
        if (fileName.canceled || fileName === undefined) {
            console.log("No file selected");
            return;
        }
        fs.readFile(fileName.filePaths[0], 'utf8', (err, data) => {
            if (err) {
                alert("An error ocurred reading the file :" + err.message);
                return;
            }
            let parsedData = JSON.parse(data)
            let formattedGraphs = parsedData.graph.map((state, i) => {
                return { states: state, idx: v++ }
            })
            let formattedDataSources = parsedData.data.map((state, i) => {
                return { states: state, idx: d++ }
            })
            let formattedData = { data: formattedDataSources, graph: formattedGraphs }
            win.webContents.send('importTemplate', formattedData)
        })


    });
}

function openProject(win) {
    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{
            name: 'Project',
            extensions: ['project']
        }]
    }).then((fileName) => {
        if (fileName.canceled || fileName === undefined) {
            console.log("No file selected");
            return;
        }
        fs.readFile(fileName.filePaths[0], 'utf8', (err, data) => {
            if (err) {
                alert("An error ocurred reading the file :" + err.message);
                return;
            }
            let parsedData = JSON.parse(data)
            let v = 0;
            let formattedGraphs = parsedData.graph.map((state, i) => {
                return { states: state, idx: v++ }
            })
            let d = 0;
            let formattedDataSources = parsedData.data.map((state, i) => {
                return { ...state, idx: d++ }
            })
            let formattedData = { data: formattedDataSources, graph: formattedGraphs, test:fileName.test ? fileName.test : false }
            win.webContents.send('openProject', formattedData)
        })


    });
}

module.exports = { importFunction, exportDataFunctionXLSX, exportDataFunctionCSV, regression, networkGraph, saveAsTemplate, importTemplate, exportPDF, saveProject, openProject }