const { app, BrowserWindow, Menu, dialog } = require('electron');
const fs = require('fs');
const path = require('path')
const papaparse = require('papaparse')
const xlsx = require('xlsx')

function importFunction(win) {
    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{
            name: 'Data',
            extensions: ['csv', 'xlsx']
        }]
    }).then((fileName) => {
        if (fileName.canceled || fileName === undefined) {
            console.log("No file selected");
            return;
        }

        if (fileName.filePaths[0].split('.').pop() == "xlsx") {
            const wb = xlsx.readFile(fileName.filePaths[0]);
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = xlsx.utils.sheet_to_json(ws);
            win.webContents.send('Import', { data: data })
        } else {
            fs.readFile(fileName.filePaths[0], 'utf8', (err, data) => {
                if (err) {
                    alert("An error ocurred reading the file :" + err.message);
                    return;
                }
                data = papaparse.parse(data, {
                    delimiter: "",	// auto-detect
                    newline: "",	// auto-detect
                    quoteChar: '"',
                    escapeChar: '"',
                    header: true,
                    transformHeader: undefined,
                    dynamicTyping: true,
                    preview: 0,
                    encoding: "",
                    worker: false,
                    comments: false,
                    step: undefined,
                    complete: undefined,
                    error: undefined,
                    download: false,
                    downloadRequestHeaders: undefined,
                    downloadRequestBody: undefined,
                    skipEmptyLines: true,
                    chunk: undefined,
                    chunkSize: undefined,
                    fastMode: undefined,
                    beforeFirstChunk: undefined,
                    withCredentials: undefined,
                    transform: undefined,
                    delimitersToGuess: [',', '\t', '|', ';', papaparse.RECORD_SEP, papaparse.UNIT_SEP],
                    skipFirstNLines: 0
                })
                win.webContents.send('Import', data)
            })
        }

    });
}

function exportDataFunctionXLSX(win) {
    win.webContents.send('ExportData', "xlsx")
}

function exportDataFunctionCSV(win) {
    win.webContents.send('ExportData', "csv")
}

let v = 0;
function regression(win, dirname) {
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

function saveAsTemplate(win) {
    win.webContents.send('SaveAsTemplate', "SaveAsTemplate")
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
            let formattedGraphs = parsedData.graph.map((state, i) =>{
                return {states: state, idx: v++}
            })
            let formattedData = {data: parsedData.data, graph: formattedGraphs}
            win.webContents.send('importTemplate', formattedData)
        })


    });
}

module.exports = { importFunction, exportDataFunctionXLSX, exportDataFunctionCSV, regression, saveAsTemplate, importTemplate }