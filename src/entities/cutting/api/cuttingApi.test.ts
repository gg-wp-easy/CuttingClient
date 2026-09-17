import {postJson} from 'shared/api';
import {calculateLinear} from './cuttingApi';
import type {LinearCutRequest} from '../model/types';
vi.mock('shared/api', () => ({postJson: vi.fn()}));
const post = vi.mocked(postJson);
const request: LinearCutRequest = {original_length: 100, cut_length: [25], cut_count: [4], blade_thickness: 0, cutting_angle: 0, original_thickness: 0};
test('rejects an outdated or malformed server response', async () => {
    post.mockResolvedValue({maps: [[4, 0]], result_maps: [[25, 25, 25, 25, 0]]});
    await expect(calculateLinear(request)).rejects.toThrow('Обновите сервер');
});
