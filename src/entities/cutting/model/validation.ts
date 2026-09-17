import type {LinearCutRequest, SheetCutRequest} from './types';
const positiveInteger = (value: number): boolean => Number.isInteger(value) && value > 0;
export function validateLinearRequest(request: LinearCutRequest): void {
    const stocks = request.originals_length ?? [request.original_length];
    if (!stocks.length || !request.cut_length.length || request.cut_length.length !== request.cut_count.length
        || ![...stocks, ...request.cut_length, ...request.cut_count].every(positiveInteger)) {
        throw new Error('Введите положительные целые длины и количества деталей.');
    }
    if (![request.blade_thickness, request.original_thickness].every(value => Number.isFinite(value) && value >= 0)
        || ![0, 30, 45, 60].includes(request.cutting_angle)) {
        throw new Error('Проверьте ширину пропила, толщину материала и угол реза.');
    }
    if (request.cutting_angle !== 0 && request.original_thickness === 0) {
        throw new Error('Для наклонного реза укажите толщину материала.');
    }
}
export function validateSheetRequest(request: SheetCutRequest): void {
    if (![request.material_height, request.material_width].every(positiveInteger)
        || !request.pieces.length || !request.pieces.flat().every(positiveInteger)) {
        throw new Error('Введите положительные целые размеры листа, деталей и их количества.');
    }
}
