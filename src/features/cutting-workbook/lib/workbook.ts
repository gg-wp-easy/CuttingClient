import * as XLSX from 'xlsx';

export function parseOrderRows(data: unknown[][], columns: number): number[][] {
    const populated = data.filter(row => row.some(value => value !== '' && value !== null && value !== undefined));
    if (populated.length && typeof populated[0][0] === 'string'
        && /длина|length|height|высота/i.test(populated[0][0])) populated.shift();
    if (!populated.length) throw new Error('В файле нет деталей для раскроя.');
    return populated.map((row, index) => {
        if (row.length !== columns) throw new Error(`Строка ${index + 1}: требуется ${columns} столбца.`);
        const values = row.map(value => typeof value === 'number' ? value :
            typeof value === 'string' && value.trim() ? Number(value.replace(',', '.')) : NaN);
        if (!values.every(value => Number.isInteger(value) && value > 0)) {
            throw new Error(`Строка ${index + 1}: размеры и количества должны быть положительными целыми числами.`);
        }
        return values;
    });
}
export async function readOrder(file: File, columns: number): Promise<number[][]> {
    const workbook = XLSX.read(await file.arrayBuffer(), {type: 'array'});
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) throw new Error('Не найден первый лист Excel.');
    return parseOrderRows(XLSX.utils.sheet_to_json<unknown[]>(sheet, {header: 1}), columns);
}
export function exportResult(headers: readonly string[], rows: readonly (readonly number[])[]): void {
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet([Array.from(headers), ...rows.map(row => Array.from(row))]);
    XLSX.utils.book_append_sheet(workbook, sheet, 'Раскрой');
    XLSX.writeFile(workbook, `cutting_${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`);
}
