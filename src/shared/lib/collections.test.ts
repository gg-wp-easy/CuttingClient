import {groupRows} from './collections';
test('groups only identical ordered patterns and does not mutate input', () => {
    const rows = [[100, 1, 2, 30], [100, 2, 1, 30], [100, 1, 2, 30], [120, 1, 2, 30]];
    const original = JSON.parse(JSON.stringify(rows));
    expect(groupRows(rows)).toEqual([[100, 1, 2, 30, 2], [100, 2, 1, 30, 1], [120, 1, 2, 30, 1]]);
    expect(rows).toEqual(original);
});
