interface Column<K extends string> {key: K; label: string; min?: number; step?: number | 'any'}
export type EditableRow<K extends string> = {id: number} & Record<K, string>;
interface Props<K extends string> {
    title: string;
    columns: readonly Column<K>[];
    rows: EditableRow<K>[];
    onChange: (rows: EditableRow<K>[]) => void;
}
export function EditableTable<K extends string>({title, columns, rows, onChange}: Props<K>) {
    function addRow(): void {
        const values = Object.fromEntries(columns.map(column => [column.key, ''])) as Record<K, string>;
        onChange([...rows, {id: Math.max(0, ...rows.map(row => row.id)) + 1, ...values}]);
    }
    return <section className="panel table-panel">
        <div className="section-heading"><h2>{title}</h2>
            <button type="button" className="button secondary" onClick={addRow}>Добавить строку</button></div>
        <div className="table-scroll"><table>
            <thead><tr><th scope="col">№</th>{columns.map(column => <th scope="col" key={column.key}>{column.label}</th>)}<th scope="col">Действия</th></tr></thead>
            <tbody>{rows.map((row, index) => <tr key={row.id}>
                <td>{index + 1}</td>
                {columns.map(column => <td key={column.key}>
                    <input aria-label={`${column.label}, строка ${index + 1}`} type="number"
                        value={row[column.key]} min={column.min ?? 1} step={column.step ?? 1} required
                        onChange={event => onChange(rows.map(item => item.id === row.id
                            ? {...item, [column.key]: event.target.value} : item))}/>
                </td>)}
                <td><button type="button" className="icon-button" aria-label={`Удалить строку ${index + 1}`}
                    onClick={() => onChange(rows.filter(item => item.id !== row.id))}>×</button></td>
            </tr>)}</tbody>
        </table></div>
        {!rows.length && <p className="muted">Добавьте первую строку или импортируйте заказ из Excel.</p>}
    </section>;
}
