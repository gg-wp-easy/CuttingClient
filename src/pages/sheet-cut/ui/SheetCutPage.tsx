import {useState} from 'react';
import type {FormEvent} from 'react';
import {AppHeader} from 'widgets/app-header';
import {useSheetCalculation} from 'features/calculate-cutting';
import {WorkbookTools} from 'features/cutting-workbook';
import {SheetCutDiagram} from 'entities/cutting';
import type {SheetRow} from 'entities/cutting';
import {EditableTable, EmptyResult, ErrorNotice, NumberField} from 'shared/ui';

export function SheetCutPage() {
    const [height, setHeight] = useState('');
    const [width, setWidth] = useState('');
    const [rows, setRows] = useState<SheetRow[]>([]);
    const {completed, pending, error, run} = useSheetCalculation();
    function submit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        void run({material_height: Number(height), material_width: Number(width),
            pieces: rows.map(row => [Number(row.lengths), Number(row.widths), Number(row.counts)])});
    }
    return <>
        <AppHeader active="sheet"/>
        <main className="workspace">
            <div className="page-title"><span className="eyebrow">ПЛАНИРОВАНИЕ ПРОИЗВОДСТВА</span>
                <h1>Двумерный раскрой</h1><p>Укажите размеры материала и прямоугольных деталей.</p></div>
            <WorkbookTools columns={3} headers={['Длина, мм', 'Ширина, мм', 'Количество']}
                rows={completed?.result.result_maps ?? []} onImport={data => setRows(data.map(([lengths, widths, counts], index) =>
                    ({id: index + 1, lengths: String(lengths), widths: String(widths), counts: String(counts)})))}/>
            <ErrorNotice message={error}/>
            <form className="cut-form" onSubmit={submit}>
                <fieldset className="panel parameters" disabled={pending}>
                    <legend>Параметры листа</legend>
                    <NumberField label="Длина листа, мм" value={height} min={1} onChange={setHeight}/>
                    <NumberField label="Ширина листа, мм" value={width} min={1} onChange={setWidth}/>
                    <button type="submit" className="button primary" disabled={pending}>{pending ? 'Вычисляем…' : 'Рассчитать раскрой →'}</button>
                </fieldset>
                <fieldset className="order-tables" disabled={pending} aria-label="Состав заказа">
                    <EditableTable title="Детали для раскроя" rows={rows} onChange={setRows} columns={[
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
