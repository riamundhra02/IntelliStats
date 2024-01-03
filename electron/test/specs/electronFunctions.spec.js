const { _electron: electron } = require('playwright')
const { test, expect, defineConfig } = require('@playwright/test')
const { importFunction, saveProject } = require('../../src/ElectronFunctions/menu')

export default defineConfig({
    retries: process.env.CI ? 2 : 0, // set to 2 when running on CI
    // ...
    use: {
        trace: 'on', // record traces on first retry of each test
    },
});

let electronApp;
let window;
test.beforeAll(async () => {
    electronApp = await electron.launch({ args: ['src/index.js'], env: { mode: 'test' }, acceptDownloads: true, headless: false })
    electronApp.process().stdout.on('data', (data) => console.log(`stdout: ${data}`));
    window = await electronApp.firstWindow();
    const isPackaged = await electronApp.evaluate(async ({ app }) => {
        // This runs in Electron's main process, parameter here is always
        // the result of the require('electron') in the main app script.
        return app.isPackaged
    })

    expect(isPackaged).toBe(false)
})

test('Import and Export Data', async () => {

    await electronApp.evaluate(async (e) => {
        let { dialog, app, ipcMain, BrowserWindow } = e
        ipcMain.on('loaded', () => {
            dialog.showOpenDialog = () => Promise.resolve({ canceled: false, filePaths: ['/Users/riamundhra/Downloads/Book1.csv'] });
            dialog.showSaveDialog = () => Promise.resolve({ canceled: false, filePath: '/Users/riamundhra/Downloads/Book1aaaa_save.xlsx' });
            const fileMenuItem = app.applicationMenu.getMenuItemById('File');
            const importMenuItem = fileMenuItem.submenu.getMenuItemById('Import Data');
            const exportMenuItem = fileMenuItem.submenu.getMenuItemById('Export');
            const exportDataMenuItem = exportMenuItem.submenu.getMenuItemById('Export Data');
            const xlsxDataMenuItem = exportDataMenuItem.submenu.getMenuItemById('.xlsx');
            importMenuItem.click()
            setTimeout(async () => {
                xlsxDataMenuItem.click()
            }, 2000)


        })


    });

    await window.waitForTimeout(10000)
    let data1 = await importFunction(null, { canceled: false, filePaths: ['/Users/riamundhra/Downloads/Book1.csv'] })
    let data2 = await importFunction(null, { canceled: false, filePaths: ['/Users/riamundhra/Downloads/Book1aaaa_save.xlsx'] })
    expect(data1).toEqual(data2)

})

test("Save Project", async () => {

    await electronApp.evaluate(async (e) => {
        let { dialog, app, ipcMain, BrowserWindow } = e
        dialog.showSaveDialog = () => Promise.resolve({ canceled: false, filePath: '/Users/riamundhra/Downloads/tests1.project' });
        const fileMenuItem = app.applicationMenu.getMenuItemById('File');

        const insertMenuItem = app.applicationMenu.getMenuItemById('Insert');
        const regModelMenuItem = insertMenuItem.submenu.getMenuItemById('Regression Model');

        const saveMenuItem = fileMenuItem.submenu.getMenuItemById('Save')
        const saveProjectMenuItem = saveMenuItem.submenu.getMenuItemById('Save Project')

        regModelMenuItem.click()
        regModelMenuItem.click()
        saveProjectMenuItem.click()


    });

    await window.waitForTimeout(2000)

    let expected = require("./saveProjectExpected.json")

    const fs = require("fs");
    let contents = fs.readFileSync("/Users/riamundhra/Downloads/tests1.project").toString();
    let actual = JSON.parse(contents)

    expect(actual).toEqual(expected)

})

test("Import Project", async () => {

    await electronApp.evaluate(async (e) => {
        let { dialog, app, ipcMain, BrowserWindow } = e
        dialog.showOpenDialog = () => Promise.resolve({ canceled: false, filePaths: ['/Users/riamundhra/Downloads/tests1.project'], test:true });
        const fileMenuItem = app.applicationMenu.getMenuItemById('File');

        const openProjectMenuItem = fileMenuItem.submenu.getMenuItemById('Open Project')

        openProjectMenuItem.click()

    });
    window.on('dialog', dialog => dialog.accept());
    await window.waitForTimeout(5000)

    const graphCount = await window.locator('div.graph').count()
    expect(graphCount).toBe(2)

    const sheetCount = await window.locator('div.ag-theme-alpine').count()
    expect(sheetCount).toBe(1)


})

test.afterAll(async () => {
    await electronApp.close()
})