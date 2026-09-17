import {LinearCutDiagram} from 'entities/cutting';
import type {LinearCutResult, LinearCutRequest} from 'entities/cutting';
import {formatNumber, groupRows} from 'shared/lib';

export function LinearCutResultPanel({result, request}: {result: LinearCutResult; request: LinearCutRequest}) {
    const rows = groupRows(result.maps.map((row, index) => [result.stock_lengths[index], ...row]));
    const metrics = [
        ['Исходных заготовок', result.summary.stock_count, ''],
        ['Деталей в заказе', result.summary.part_count, ''],
        ['Суммарный остаток', result.summary.total_remainder, 'мм'],
        ['Потери на пропил', result.summary.kerf_loss, 'мм'],
    ] as const;
    return <section className="panel result-panel" aria-label="Результат линейного раскроя">
        <h2>Карта раскроя</h2>
        <div className="summary-grid">{metrics.map(([label, value, unit]) => <div key={label}>
            <span>{label}</span><strong>{formatNumber(value)} <small>{unit}</small></strong>
        </div>)}</div>
        <div className="table-scroll"><table>
            <thead><tr><th>Исходная длина, мм</th>{request.cut_length.map((length, index) => <th key={index}>{length} мм</th>)}<th>Остаток, мм</th><th>Повторений</th></tr></thead>
            <tbody>{rows.map((row, index) => <tr key={index}>{row.map((value, column) => <td key={column}>{formatNumber(value)}</td>)}</tr>)}</tbody>
        </table></div>
        <LinearCutDiagram result={result} thickness={request.original_thickness} angle={request.cutting_angle}/>
    </section>;
}
