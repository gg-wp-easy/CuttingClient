export function groupRows(rows: readonly (readonly number[])[]): number[][] {
    const grouped = new Map<string, number[]>();
    for (const row of rows) {
        const key = JSON.stringify(row);
        const existing = grouped.get(key);
        if (existing) existing[existing.length - 1] += 1;
        else grouped.set(key, [...row, 1]);
    }
    return [...grouped.values()];
}

export const formatNumber = (value: number): string =>
    new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 3}).format(value);

export const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);
