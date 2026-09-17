import {validateLinearRequest, validateSheetRequest} from './validation';
import type {LinearCutRequest} from './types';
const valid: LinearCutRequest = {original_length: 100, cut_length: [25], cut_count: [4], blade_thickness: .5, cutting_angle: 0, original_thickness: 0};
test('accepts a fractional kerf, rejects empty stocks and invalid quantities', () => {
    expect(() => validateLinearRequest(valid)).not.toThrow();
    expect(() => validateLinearRequest({...valid, cut_count: [1.5]})).toThrow();
    expect(() => validateLinearRequest({...valid, blade_thickness: NaN})).toThrow();
    expect(() => validateLinearRequest({...valid, cutting_angle: 45})).toThrow();
    const {original_length, ...parameters} = valid;
    expect(() => validateLinearRequest({...parameters, originals_length: []})).toThrow();
});
test('requires dimensions and counts for sheets', () => {
    expect(() => validateSheetRequest({material_height: 100, material_width: 100, pieces: []})).toThrow();
});
