import {useEffect, useState} from 'react';
import type {SheetDraft} from 'entities/cutting';
import {createDraft, restoreDraft} from './draft';

const STORAGE_KEY = 'cutopt.sheet-draft.v1';
function loadStoredDraft(): SheetDraft | null {
    try { return restoreDraft(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')); }
    catch { return null; }
}
export function useSheetDraft() {
    const [draft, setDraft] = useState(() => loadStoredDraft() ?? createDraft());
    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(draft)); }
        catch { /* Local storage may be disabled; the in-memory draft still works. */ }
    }, [draft]);
    function update(patch: Partial<SheetDraft>): void {
        setDraft(current => ({...current, ...patch}));
    }
    return {draft, update};
}
