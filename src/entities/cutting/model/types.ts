export type CuttingAngle = 0 | 30 | 45 | 60;
export interface LinearParameters {
    cut_length: number[];
    cut_count: number[];
    blade_thickness: number;
    cutting_angle: CuttingAngle;
    original_thickness: number;
}
export type LinearCutRequest = LinearParameters & (
    {original_length: number; originals_length?: never} |
    {originals_length: number[]; original_length?: never}
);
export interface LinearCutSummary {
    stock_count: number;
    part_count: number;
    total_stock: number;
    total_remainder: number;
    kerf_loss: number;
    optimal: boolean;
}
export interface LinearCutResult {
    maps: number[][];
    result_maps: number[][];
    stock_lengths: number[];
    summary: LinearCutSummary;
}
export type SheetPiece = [height: number, width: number, count: number];
export interface SheetCutRequest {
    material_height: number;
    material_width: number;
    pieces: SheetPiece[];
}
export interface SheetCutResult {result_maps: SheetPiece[]}
export type CutRow = {id: number; cuts: string; counts: string};
export type StockRow = {id: number; cuts: string};
export type SheetRow = {id: number; lengths: string; widths: string; counts: string};
export interface LinearDraft {
    version: 1;
    inputValue: string;
    blade: string;
    angle: CuttingAngle;
    thickness: string;
    multiLinear: boolean;
    stocks: StockRow[];
    rows: CutRow[];
}
export interface SheetDraft {
    version: 1;
    height: string;
    width: string;
    rows: SheetRow[];
}
