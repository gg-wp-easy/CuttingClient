import {useState} from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {EditableTable} from './EditableTable';
import type {EditableRow} from './EditableTable';
function Editor() {
    const [rows, setRows] = useState<EditableRow<'length'>[]>([{id: 1, length: '100'}, {id: 2, length: '200'}]);
    return <form><EditableTable title="Детали" columns={[{key: 'length', label: 'Длина'}]} rows={rows} onChange={setRows}/></form>;
}
test('delete then add preserves row identity and independent editing', () => {
    render(<Editor/>);
    fireEvent.click(screen.getByRole('button', {name: 'Удалить строку 1'}));
    fireEvent.click(screen.getByRole('button', {name: 'Добавить строку'}));
    fireEvent.change(screen.getByLabelText('Длина, строка 2'), {target: {value: '300'}});
    expect(screen.getByLabelText('Длина, строка 1')).toHaveValue(200);
    expect(screen.getByLabelText('Длина, строка 2')).toHaveValue(300);
});
