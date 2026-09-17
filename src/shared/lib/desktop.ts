interface DesktopBridge {
    openHistory(): void;
    openAbout(): void;
    exit(draft?: unknown): void;
    loadDraft(onLoad: (data: unknown) => void): () => void;
}

declare global {
    interface Window {cutopt?: DesktopBridge}
}

export const desktop = {
    get available(): boolean { return Boolean(window.cutopt); },
    openHistory: (): void => window.cutopt?.openHistory(),
    openAbout: (): void => window.cutopt?.openAbout(),
    exit: (draft?: unknown): void => window.cutopt?.exit(draft),
    loadDraft(onLoad: (data: unknown) => void): () => void {
        return window.cutopt?.loadDraft(onLoad) ?? (() => undefined);
    },
};
