import {postJson} from 'shared/api';
import {isRecord} from 'shared/lib';
import type {LinearCutRequest, LinearCutResult, SheetCutRequest, SheetCutResult} from '../model/types';

const numericArray = (value: unknown): value is number[] =>
    Array.isArray(value) && value.every(item => typeof item === 'number' && Number.isFinite(item) && item >= 0);
const matrix = (value: unknown): value is number[][] => Array.isArray(value) && value.every(numericArray);

export async function calculateLinear(request: LinearCutRequest, signal?: AbortSignal): Promise<LinearCutResult> {
    const data = await postJson(request.originals_length ? '/linear-multi-cut' : '/linear-cut/', request, signal);
    if (!isRecord(data) || !matrix(data.maps) || !matrix(data.result_maps) || !numericArray(data.stock_lengths)
        || data.maps.length !== data.stock_lengths.length || data.result_maps.length !== data.maps.length
        || !data.maps.every(row => row.length === request.cut_length.length + 1)
        || !data.result_maps.every(row => row.length > 0) || !isRecord(data.summary)) {
        throw new Error('Служба вернула некорректную карту раскроя. Обновите сервер.');
    }
    const summary = data.summary;
    if (!['stock_count', 'part_count', 'total_stock', 'total_remainder', 'kerf_loss']
        .every(key => typeof summary[key] === 'number' && Number.isFinite(summary[key]) && Number(summary[key]) >= 0)
        || typeof summary.optimal !== 'boolean') {
        throw new Error('Служба вернула некорректную сводку раскроя.');
    }
    return data as unknown as LinearCutResult;
}
export async function calculateSheet(request: SheetCutRequest, signal?: AbortSignal): Promise<SheetCutResult> {
    const data = await postJson('/bivariate-cut', request, signal);
    if (!isRecord(data) || !matrix(data.result_maps) || !data.result_maps.every(row =>
        row.length === 3 && row.every(value => Number.isInteger(value) && value > 0))) {
        throw new Error('Служба вернула некорректный результат листового раскроя.');
    }
    return data as unknown as SheetCutResult;
}
