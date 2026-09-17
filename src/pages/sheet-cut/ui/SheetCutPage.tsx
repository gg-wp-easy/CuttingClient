import type {FormEvent} from 'react';
import {AppHeader} from 'widgets/app-header';
import {useSheetCalculation} from 'features/calculate-cutting';
import {WorkbookTools} from 'features/cutting-workbook';
import {SheetCutDiagram} from 'entities/cutting';
import {EditableTable, EmptyResult, ErrorNotice, NumberField} from 'shared/ui';
import {useSheetDraft} from '../model/useSheetDraft';

export function SheetCutPage() {
    const {draft, update} = useSheetDraft();
    const {completed, pending, error, run} = useSheetCalculation();
    function submit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        void run({material_height: Number(draft.height), material_width: Number(draft.width),
            pieces: draft.rows.map(row => [Number(row.lengths), Number(row.widths), Number(row.counts)])});
    }
    return <>
        <AppHeader active="sheet"/>
        <main className="workspace">
            <div className="page-title"><span className="eyebrow">ПЛАНИРОВАНИЕ ПРОИЗВОДСТВА</span>
                <h1>Двумерный раскрой</h1><p>Укажите размеры материала и прямоугольных деталей.</p></div>
            <WorkbookTools columns={3} headers={['Длина, мм', 'Ширина, мм', 'Количество']}
                rows={completed?.result.result_maps ?? []} onImport={data => update({rows: data.map(([lengths, widths, counts], index) =>
                    ({id: index + 1, lengths: String(lengths), widths: String(widths), counts: String(counts)}))})}/>
            <ErrorNotice message={error}/>
            <form className="cut-form" onSubmit={submit}>
                <fieldset className="panel parameters" disabled={pending}>
                    <legend>Параметры листа</legend>
                    <NumberField label="Длина листа, мм" value={draft.height} min={1} onChange={height => update({height})}/>
                    <NumberField label="Ширина листа, мм" value={draft.width} min={1} onChange={width => update({width})}/>
                    <button type="submit" className="button primary" disabled={pending}>{pending ? 'Вычисляем…' : 'Рассчитать раскрой →'}</button>
                </fieldset>
                <fieldset className="order-tables" disabled={pending} aria-label="Состав заказа">
                    <EditableTable title="Детали для раскроя" rows={draft.rows} onChange={rows => update({rows})} columns={[
                        {key: 'lengths', label: 'Длина, мм'}, {key: 'widths', label: 'Ширина, мм'}, {key: 'counts', label: 'Количество'},
                    ]}/>
                </fieldset>
            </form>
            {completed ? <section className="panel result-panel">
                <h2>Результат для листа {completed.request.material_height} × {completed.request.material_width} мм</h2>
                {completed.result.result_maps.length ? <>
                    <p className="muted">Детали из ответа службы. Координаты размещения на листе сервер пока не передаёт.</p>
                    <SheetCutDiagram pieces={completed.result.result_maps}/>
                </> : <p>Служба не подобрала подходящие детали.</p>}
            </section> : <EmptyResult pending={pending}/>}
        </main>
    </>;
}
