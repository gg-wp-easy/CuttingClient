import {app, BrowserWindow, dialog, ipcMain, Menu, nativeTheme} from 'electron';
import {spawn, execFile} from 'node:child_process';
import type {ChildProcessWithoutNullStreams} from 'node:child_process';
import {createWriteStream, existsSync} from 'node:fs';
import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';

let mainWindow: BrowserWindow | null = null;
let loadingWindow: BrowserWindow | null = null;
let server: ChildProcessWithoutNullStreams | null = null;
let confirmingClose = false;
const windows = new Set<BrowserWindow>();
const assets = (): string => path.join(app.getAppPath(), app.isPackaged ? 'build' : 'public');
const draftPath = (): string => path.join(app.getPath('userData'), 'local_data.json');

function track(window: BrowserWindow): BrowserWindow {
    windows.add(window);
    window.on('closed', () => windows.delete(window));
    return window;
}
function stopServer(): void {
    if (!server) return;
    if (server.pid && process.platform === 'win32') {
        execFile('taskkill', ['/PID', String(server.pid), '/T', '/F'], error => {
            if (error) console.error('Не удалось остановить службу:', error.message);
        });
    } else server.kill();
    server = null;
}
function startServer(): void {
    const executable = process.env.CUTTING_SERVER_PATH || path.join(assets(), 'server', 'dist', process.platform === 'win32' ? 'main.exe' : 'main');
    // In browser development the Python service can be started separately.
    if (!existsSync(executable) && !app.isPackaged) return;
    server = spawn(executable, [], {cwd: app.getPath('userData'), windowsHide: true});
    const log = createWriteStream(path.join(app.getPath('userData'), 'server.log'), {flags: 'w'});
    log.on('error', error => console.error(error));
    server.stdout.pipe(log, {end: false});
    server.stderr.pipe(log, {end: false});
    server.on('close', () => log.end());
    server.on('error', error => dialog.showErrorBox('Служба раскроя не запущена', error.message));
}
function closeWindows(): void {
    stopServer();
    for (const window of windows) if (!window.isDestroyed()) window.destroy();
    if (loadingWindow && !loadingWindow.isDestroyed()) loadingWindow.destroy();
}
async function confirmExit(draft?: unknown): Promise<void> {
    if (!mainWindow || confirmingClose) return;
    confirmingClose = true;
    try {
        const {response} = await dialog.showMessageBox(mainWindow, {
            type: 'question', title: 'Выход из CutOpt', buttons: ['Выйти', 'Отмена'],
            defaultId: 1, cancelId: 1, message: 'Закрыть приложение?',
        });
        if (response !== 0) return;
        if (draft !== undefined) await writeFile(draftPath(), JSON.stringify(draft), 'utf8');
        closeWindows();
    } catch (error) {
        dialog.showErrorBox('Не удалось сохранить данные', error instanceof Error ? error.message : String(error));
    } finally { confirmingClose = false; }
}
function createWindow(): void {
    const window = track(new BrowserWindow({
        width: 1200, height: 900, minWidth: 680, minHeight: 600, show: false,
        title: 'NK-CutOpt — оптимальный раскрой', icon: path.join(assets(), 'favicon.ico'),
        webPreferences: {preload: path.join(__dirname, 'preload.js'), nodeIntegration: false, contextIsolation: true},
    }));
    mainWindow = window;
    const rendererUrl = !app.isPackaged && process.env.ELECTRON_RENDERER_URL;
    if (rendererUrl) void window.loadURL(rendererUrl);
    else void window.loadFile(path.join(app.getAppPath(), 'build', 'index.html'));
    window.once('ready-to-show', () => {
        window.show();
        loadingWindow?.close(); loadingWindow = null;
    });
    window.on('close', event => {event.preventDefault(); void confirmExit();});
    window.on('closed', () => {mainWindow = null; stopServer();});
    Menu.setApplicationMenu(null);
}
function startApplication(): void {
    startServer();
    loadingWindow = new BrowserWindow({width: 400, height: 300, frame: false});
    void loadingWindow.loadFile(path.join(assets(), 'loading.html'));
    createWindow();
}
function openAuxiliary(file: string): void {
    const window = track(new BrowserWindow({width: 900, height: 600}));
    void window.loadFile(path.join(assets(), file));
}

ipcMain.on('load-data', async event => {
    try {
        const file = existsSync(draftPath()) ? draftPath() : path.join(assets(), 'local_data.json');
        const draft: unknown = JSON.parse(await readFile(file, 'utf8'));
        if (!event.sender.isDestroyed()) event.sender.send('data-loaded', draft);
    } catch { if (!event.sender.isDestroyed()) event.sender.send('data-loaded', []); }
});
ipcMain.on('exit-app', (_event, draft: unknown) => {void confirmExit(draft);});
ipcMain.on('open-history-cuts', () => openAuxiliary('historyWindow.html'));
ipcMain.on('open-memo', () => openAuxiliary('memoWindow.html'));
ipcMain.handle('dark-mode:toggle', () => {
    nativeTheme.themeSource = nativeTheme.shouldUseDarkColors ? 'light' : 'dark';
    return nativeTheme.shouldUseDarkColors;
});
ipcMain.handle('dark-mode:system', () => {nativeTheme.themeSource = 'system';});
app.on('before-quit', stopServer);
app.on('window-all-closed', () => {if (process.platform !== 'darwin') app.quit();});
app.on('activate', () => {if (BrowserWindow.getAllWindows().length === 0) startApplication();});
void app.whenReady().then(startApplication);
