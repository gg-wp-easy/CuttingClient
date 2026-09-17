import type {SheetDraft, SheetRow} from 'entities/cutting';
import {isRecord} from 'shared/lib';

export const createDraft = (): SheetDraft => ({version: 1, height: '', width: '', rows: []});
const numericText = (value: unknown): string | undefined =>
    typeof value === 'string' || typeof value === 'number' ? String(value) : undefined;

export function restoreDraft(value: unknown): SheetDraft | null {
    if (!isRecord(value) || !Array.isArray(value.rows)) return null;
    const height = numericText(value.height);
    const width = numericText(value.width);
    if (height === undefined || width === undefined) return null;
    const rows: SheetRow[] = [];
    for (const [index, row] of value.rows.entries()) {
        if (!isRecord(row)) return null;
        rows.push({
            id: index + 1, lengths: numericText(row.lengths) ?? '',
            widths: numericText(row.widths) ?? '', counts: numericText(row.counts) ?? '',
        });
    }
    return {version: 1, height, width, rows};
}
