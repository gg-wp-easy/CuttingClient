import type {CuttingAngle, LinearDraft, CutRow, StockRow} from 'entities/cutting';
import {isRecord} from 'shared/lib';

export const createDraft = (): LinearDraft => ({
    version: 1, inputValue: '', blade: '0', angle: 0, thickness: '0',
    multiLinear: false, stocks: [], rows: [],
});
const numericText = (value: unknown): string | undefined =>
    typeof value === 'string' || typeof value === 'number' ? String(value) : undefined;

export function restoreDraft(value: unknown): LinearDraft | null {
    // Versions before TypeScript saved an array of five small objects.
    let candidate: unknown = value;
    if (Array.isArray(value)) {
        if (value.length < 5 || !value.every(isRecord)) return null;
        candidate = Object.assign({}, ...value);
    }
    if (!isRecord(candidate) || !Array.isArray(candidate.rows)) return null;
    const inputValue = numericText(candidate.inputValue);
    const blade = numericText(candidate.blade);
    const thickness = numericText(candidate.thickness);
    const angle = Number(candidate.angle);
    if (inputValue === undefined || blade === undefined || thickness === undefined || ![0, 30, 45, 60].includes(angle)) return null;
    const rows: CutRow[] = [];
    for (const [index, row] of candidate.rows.entries()) {
        if (!isRecord(row)) return null;
        const cuts = numericText(row.cuts) ?? '';
        const counts = numericText(row.counts) ?? '';
        rows.push({id: index + 1, cuts, counts});
    }
    const stocks: StockRow[] = [];
    if (Array.isArray(candidate.stocks)) {
        for (const [index, stock] of candidate.stocks.entries()) {
            if (!isRecord(stock)) return null;
            stocks.push({id: index + 1, cuts: numericText(stock.cuts) ?? ''});
        }
    }
    return {version: 1, inputValue, blade, thickness, angle: angle as CuttingAngle,
        multiLinear: candidate.multiLinear === true, stocks, rows};
}
