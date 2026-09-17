import {parseOrderRows} from './workbook';
test('reads a header and skips empty rows', () => {
    expect(parseOrderRows([['Длина', 'Количество'], [], [500, 2], ['250', '3']], 2)).toEqual([[500, 2], [250, 3]]);
});
test('reads sheet sizes and rejects missing columns, empty cells and fractional counts', () => {
    expect(parseOrderRows([[100, 200, 3]], 3)).toEqual([[100, 200, 3]]);
    for (const rows of [[], [[100]], [[100, '']], [[100, 1.5]], [[100, -1]], [[100, 2, 4]]]) {
        expect(() => parseOrderRows(rows, 2)).toThrow();
    }
});
