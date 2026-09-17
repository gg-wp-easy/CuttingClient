import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld('cutopt', {
    openHistory: (): void => ipcRenderer.send('open-history-cuts'),
    openAbout: (): void => ipcRenderer.send('open-memo'),
    exit: (draft?: unknown): void => ipcRenderer.send('exit-app', draft),
    loadDraft(onLoad: (data: unknown) => void): () => void {
        const listener = (_event: unknown, data: unknown): void => onLoad(data);
        ipcRenderer.on('data-loaded', listener);
        ipcRenderer.send('load-data');
        return () => {ipcRenderer.removeListener('data-loaded', listener);};
    },
});
