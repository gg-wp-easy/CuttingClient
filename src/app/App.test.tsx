import {fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import {App} from './App';
const fetchMock = vi.fn();
const response = {
    maps: [[4, 0], [4, 0], [4, 0]], result_maps: [[25, 25, 25, 25, 0], [25, 25, 25, 25, 0], [25, 25, 25, 25, 0]],
    stock_lengths: [100, 100, 100], summary: {stock_count: 3, part_count: 12, total_stock: 300, total_remainder: 0, kerf_loss: 0, optimal: true},
};
function fill(label: string, value: string): void {fireEvent.change(screen.getByLabelText(label), {target: {value}});}
beforeEach(() => {
    localStorage.clear(); window.location.hash = '#/';
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({ok: true, json: async () => response});
    global.fetch = fetchMock;
});
async function openLinear(): Promise<void> {
    render(<App/>);
    await screen.findByRole('heading', {name: 'Линейный раскрой'}, {timeout: 5000});
    fill('Исходная длина, мм', '100');
    fireEvent.click(screen.getByRole('button', {name: 'Добавить строку'}));
    fill('Длина, мм, строка 1', '25'); fill('Количество, строка 1', '12');
}
test('calculates and renders the result using the submitted snapshot', async () => {
    await openLinear();
    fireEvent.click(screen.getByRole('button', {name: 'Рассчитать раскрой →'}));
    await screen.findByRole('heading', {name: 'Карта раскроя'});
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({original_length: 100, cut_length: [25], cut_count: [12], blade_thickness: 0, cutting_angle: 0, original_thickness: 0});
    fill('Длина, мм, строка 1', '30');
    expect(screen.getByRole('columnheader', {name: '25 мм'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Экспорт результата'})).toBeEnabled();
});
test('shows request failure and lets the user retry', async () => {
    await openLinear();
    fetchMock.mockRejectedValueOnce(new Error('offline'));
    fireEvent.click(screen.getByRole('button', {name: 'Рассчитать раскрой →'}));
    expect(await screen.findByRole('alert')).toHaveTextContent('Служба раскроя недоступна');
    fireEvent.click(screen.getByRole('button', {name: 'Рассчитать раскрой →'}));
    await screen.findByRole('heading', {name: 'Карта раскроя'});
    expect(fetchMock).toHaveBeenCalledTimes(2);
});
test('submits multiple stock lengths to the multi-cut endpoint', async () => {
    await openLinear();
    fireEvent.click(screen.getByRole('checkbox', {name: 'Несколько исходных длин'}));
    const stocks = screen.getByRole('heading', {name: 'Исходные длины'}).closest('section')!;
    fireEvent.click(within(stocks).getByRole('button', {name: 'Добавить строку'}));
    fireEvent.change(within(stocks).getByLabelText('Длина, мм, строка 1'), {target: {value: '100'}});
    fireEvent.click(screen.getByRole('button', {name: 'Рассчитать раскрой →'}));
    await screen.findByRole('heading', {name: 'Карта раскроя'});
    expect(fetchMock.mock.calls[0][0]).toMatch(/linear-multi-cut$/);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).originals_length).toEqual([100]);
});
test('opens the sheet page through the Electron-compatible hash route', async () => {
    window.location.hash = '#/double';
    render(<App/>);
    await screen.findByRole('heading', {name: 'Двумерный раскрой'});
    fill('Длина листа, мм', '100'); fill('Ширина листа, мм', '200');
    fireEvent.click(screen.getByRole('button', {name: 'Добавить строку'}));
    fill('Длина, мм, строка 1', '10'); fill('Ширина, мм, строка 1', '20'); fill('Количество, строка 1', '3');
    fetchMock.mockResolvedValueOnce({ok: true, json: async () => ({result_maps: [[10, 20, 3]]})});
    fireEvent.click(screen.getByRole('button', {name: 'Рассчитать раскрой →'}));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({material_height: 100, material_width: 200, pieces: [[10, 20, 3]]});
    await screen.findByRole('heading', {name: 'Результат для листа 100 × 200 мм'});
});
