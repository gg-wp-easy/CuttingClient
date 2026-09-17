import {useState} from 'react';
import {ErrorNotice} from 'shared/ui';
import {exportResult, readOrder} from '../lib/workbook';

interface Props {
    columns: 2 | 3;
    onImport: (rows: number[][]) => void;
    headers: string[];
    rows: number[][];
}
export function WorkbookTools({columns, onImport, headers, rows}: Props) {
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);
    return <section className="workbook-tools" aria-label="Работа с Excel">
        <div className="toolbar">
            <label className="button secondary file-button">
                {pending ? 'Читаем файл…' : 'Импорт из Excel'}
                <input type="file" accept=".xlsx,.xls,.csv" disabled={pending}
                    aria-label="Импорт из Excel" onChange={async event => {
                        const file = event.currentTarget.files?.[0];
                        event.currentTarget.value = '';
                        if (!file) return;
                        setPending(true); setError(null);
                        try { onImport(await readOrder(file, columns)); }
                        catch (failure) { setError(failure instanceof Error ? failure.message : 'Не удалось прочитать файл.'); }
                        finally { setPending(false); }
                    }}/>
            </label>
            <button type="button" className="button secondary" disabled={!rows.length} onClick={() => {
                try { exportResult(headers, rows); setError(null); }
                catch { setError('Не удалось сохранить файл Excel.'); }
            }}>Экспорт результата</button>
            <button type="button" className="button secondary" disabled={!rows.length} onClick={() => window.print()}>Печать</button>
        </div>
        <ErrorNotice message={error}/>
    </section>;
}
