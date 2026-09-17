import {useEffect, useRef, useState} from 'react';
import type {LinearDraft} from 'entities/cutting';
import {desktop} from 'shared/lib';
import {createDraft, restoreDraft} from './draft';

const STORAGE_KEY = 'cutopt.linear-draft.v1';
function loadStoredDraft(): LinearDraft | null {
    try { return restoreDraft(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')); }
    catch { return null; }
}
export function useLinearDraft() {
    const [localDraft] = useState(loadStoredDraft);
    const [draft, setDraft] = useState(() => localDraft ?? createDraft());
    const edited = useRef(false);
    useEffect(() => {
        if (localDraft) return;
        return desktop.loadDraft(value => {
            const restored = restoreDraft(value);
            if (restored && !edited.current) setDraft(restored);
        });
    }, [localDraft]);
    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(draft)); }
        catch { /* Local storage may be disabled; the in-memory draft still works. */ }
    }, [draft]);
    function update(patch: Partial<LinearDraft>): void {
        edited.current = true;
        setDraft(current => ({...current, ...patch}));
    }
    return {draft, update};
}
