import {desktop} from './desktop';
test('delegates to the preload bridge and returns subscription cleanup', () => {
    const unsubscribe = vi.fn();
    const callback = vi.fn();
    window.cutopt = {openHistory: vi.fn(), openAbout: vi.fn(), exit: vi.fn(), loadDraft: vi.fn(() => unsubscribe)};
    try {
        expect(desktop.available).toBe(true);
        const cleanup = desktop.loadDraft(callback);
        expect(window.cutopt.loadDraft).toHaveBeenCalledWith(callback);
        cleanup();
        expect(unsubscribe).toHaveBeenCalledOnce();
        desktop.exit({version: 1});
        expect(window.cutopt.exit).toHaveBeenCalledWith({version: 1});
    } finally { delete window.cutopt; }
});
test('works in the browser without Electron', () => {
    expect(desktop.available).toBe(false);
    expect(() => desktop.loadDraft(vi.fn())()).not.toThrow();
});
