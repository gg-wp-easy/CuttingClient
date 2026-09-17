// @vitest-environment node
import {expect, test, vi} from 'vitest';
import {contextBridge, ipcRenderer} from 'electron';
vi.mock('electron', () => ({
    contextBridge: {exposeInMainWorld: vi.fn()},
    ipcRenderer: {on: vi.fn(), send: vi.fn(), removeListener: vi.fn()},
}));
test('subscribes before requesting a draft and removes only its own listener', async () => {
    await import('./preload');
    const expose = vi.mocked(contextBridge.exposeInMainWorld);
    expect(expose).toHaveBeenCalledWith('cutopt', expect.any(Object));
    const bridge = expose.mock.calls[0][1] as {loadDraft: (callback: (data: unknown) => void) => () => void};
    const callback = vi.fn();
    const cleanup = bridge.loadDraft(callback);
    const on = vi.mocked(ipcRenderer.on);
    expect(on.mock.invocationCallOrder[0]).toBeLessThan(vi.mocked(ipcRenderer.send).mock.invocationCallOrder[0]);
    const listener = on.mock.calls[0][1];
    listener({} as Electron.IpcRendererEvent, {version: 1});
    expect(callback).toHaveBeenCalledWith({version: 1});
    cleanup();
    expect(ipcRenderer.removeListener).toHaveBeenCalledWith('data-loaded', listener);
});
