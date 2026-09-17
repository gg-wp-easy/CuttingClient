import type {FormEvent} from 'react';
import {AppHeader} from 'widgets/app-header';
import {LinearCutResultPanel} from 'widgets/linear-cut-result';
import {useLinearCalculation} from 'features/calculate-cutting';
import {WorkbookTools} from 'features/cutting-workbook';
import type {CuttingAngle, LinearCutRequest} from 'entities/cutting';
import {groupRows} from 'shared/lib';
import {EditableTable, EmptyResult, ErrorNotice, NumberField} from 'shared/ui';
import {useLinearDraft} from '../model/useLinearDraft';

export function LinearCutPage() {
    const {draft, update} = useLinearDraft();
    const {completed, pending, error, run} = useLinearCalculation();
    function submit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        const request: LinearCutRequest = {
            ...(draft.multiLinear ? {originals_length: draft.stocks.map(row => Number(row.cuts))}
                : {original_length: Number(draft.inputValue)}),
            cut_length: draft.rows.map(row => Number(row.cuts)),
            cut_count: draft.rows.map(row => Number(row.counts)),
            blade_thickness: Number(draft.blade), cutting_angle: draft.angle,
            original_thickness: Number(draft.thickness),
        };
        void run(request);
    }
    const exportRows = completed ? groupRows(completed.result.maps.map((row, index) =>
        [completed.result.stock_lengths[index], ...row])) : [];
    const headers = completed ? ['Исходная длина', ...completed.request.cut_length.map(String), 'Остаток', 'Количество заготовок'] : [];
    return <>
        <AppHeader active="linear" draft={draft}/>
        <main className="workspace">
            <div className="page-title"><span className="eyebrow">ПЛАНИРОВАНИЕ ПРОИЗВОДСТВА</span>
                <h1>Линейный раскрой</h1><p>Задайте материал и детали — получите карту с минимальным суммарным остатком.</p></div>
            <WorkbookTools columns={2} headers={headers} rows={exportRows} onImport={rows => update({
                rows: rows.map(([cuts, counts], index) => ({id: index + 1, cuts: String(cuts), counts: String(counts)})),
            })}/>
            <ErrorNotice message={error}/>
            <form className="cut-form" onSubmit={submit}>
                <fieldset className="panel parameters" disabled={pending}>
                    <legend>Параметры материала</legend>
                    <label className="toggle"><input type="checkbox" checked={draft.multiLinear}
                        onChange={event => update({multiLinear: event.target.checked})}/>Несколько исходных длин</label>
                    {!draft.multiLinear && <NumberField label="Исходная длина, мм" value={draft.inputValue} min={1} onChange={inputValue => update({inputValue})}/>}
                    <NumberField label="Ширина пропила, мм" value={draft.blade} step="any" onChange={blade => update({blade})}/>
                    <NumberField label="Толщина материала, мм" value={draft.thickness} step="any" onChange={thickness => update({thickness})}/>
                    <label className="field"><span>Угол реза</span><select value={draft.angle}
                        onChange={event => update({angle: Number(event.target.value) as CuttingAngle})}>
                        {[0, 30, 45, 60].map(angle => <option key={angle} value={angle}>{angle}°</option>)}
                    </select></label>
                    <button type="submit" className="button primary" disabled={pending}>{pending ? 'Вычисляем…' : 'Рассчитать раскрой →'}</button>
                </fieldset>
                <fieldset className="order-tables" disabled={pending} aria-label="Состав заказа">
                    {draft.multiLinear && <EditableTable title="Исходные длины" columns={[{key: 'cuts', label: 'Длина, мм'}]}
                        rows={draft.stocks} onChange={stocks => update({stocks})}/>}
                    <EditableTable title="Детали для раскроя" columns={[{key: 'cuts', label: 'Длина, мм'}, {key: 'counts', label: 'Количество'}]}
                        rows={draft.rows} onChange={rows => update({rows})}/>
                </fieldset>
            </form>
            {completed ? <LinearCutResultPanel {...completed}/> : <EmptyResult pending={pending}/>}
        </main>
    </>;
}
