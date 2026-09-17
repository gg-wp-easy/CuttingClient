export function ErrorNotice({message}: {message: string | null}) {
    return message ? <div role="alert" className="error-banner">{message}</div> : null;
}
export function EmptyResult({pending}: {pending: boolean}) {
    return <section className="empty-state" role="status">
        <h2>{pending ? 'Подбираем сочетание деталей…' : 'Здесь появится результат раскроя'}</h2>
        <p>{pending ? 'Проверяем варианты и количество деталей.' : 'Заполните параметры материала, добавьте детали и запустите расчёт.'}</p>
    </section>;
}
