const {app, BrowserWindow, ipcMain} = require('electron');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'cutopt-smoke-'));
app.setPath('userData', userData);
app.disableHardwareAcceleration();
const failures = [];
let timer;
async function waitFor(window, expression) {
    const deadline = Date.now() + 15000;
    while (Date.now() < deadline) {
        if (await window.webContents.executeJavaScript(expression)) return;
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error(`Renderer check timed out: ${expression}`);
}
app.whenReady().then(async () => {
    timer = setTimeout(() => {console.error('Electron smoke test timed out'); app.exit(1);}, 30000);
    const window = new BrowserWindow({show: false, webPreferences: {
        preload: path.join(root, 'dist-electron/preload.js'), contextIsolation: true, nodeIntegration: false,
    }});
    window.webContents.on('preload-error', (_event, _path, error) => failures.push(error.message));
    window.webContents.on('console-message', (_event, details) => {
        if (details.level === 'error') failures.push(details.message);
    });
    ipcMain.on('load-data', event => event.sender.send('data-loaded', []));
    let aboutRequested = false;
    ipcMain.on('open-memo', () => {aboutRequested = true;});
    await window.loadFile(path.join(root, 'build/index.html'));
    await waitFor(window, "document.querySelector('h1')?.textContent === 'Линейный раскрой'");
    assert.equal(await window.webContents.executeJavaScript('typeof window.cutopt?.loadDraft'), 'function');
    assert.equal(await window.webContents.executeJavaScript('typeof window.require'), 'undefined');
    await window.webContents.executeJavaScript('window.cutopt.openAbout()');
    await new Promise(resolve => setTimeout(resolve, 100));
    assert.equal(aboutRequested, true);
    await window.webContents.executeJavaScript("window.location.hash = '#/double'");
    await waitFor(window, "document.querySelector('h1')?.textContent === 'Двумерный раскрой'");
    assert.deepEqual(failures, []);
    clearTimeout(timer);
    console.log(`Electron ${process.versions.electron}: renderer, routes and preload IPC passed.`);
    window.destroy();
    app.exit(0);
}).catch(error => {clearTimeout(timer); console.error(error); app.exit(1);});
