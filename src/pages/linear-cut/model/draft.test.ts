import {createDraft, restoreDraft} from './draft';
test('restores the old Electron array format', () => {
    expect(restoreDraft([{inputValue: 6000}, {angle: '45'}, {blade: 0.5}, {thickness: 25},
        {rows: [{id: 8, cuts: 1000, counts: 2}]}])).toEqual({...createDraft(), inputValue: '6000',
        angle: 45, blade: '0.5', thickness: '25', rows: [{id: 1, cuts: '1000', counts: '2'}]});
});
test('retains multi-stock settings and rejects corrupt drafts', () => {
    const draft = {...createDraft(), multiLinear: true, stocks: [{id: 1, cuts: '5000'}]};
    expect(restoreDraft(draft)).toEqual(draft);
    expect(restoreDraft([])).toBeNull();
    expect(restoreDraft({...draft, rows: [null]})).toBeNull();
});
