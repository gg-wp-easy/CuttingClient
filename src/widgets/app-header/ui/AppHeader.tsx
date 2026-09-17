import {desktop} from 'shared/lib';
interface Props {active: 'linear' | 'sheet'; draft?: unknown}
export function AppHeader({active, draft}: Props) {
    return <header className="app-header">
        <a className="brand" href="#/">Cut<span>Opt</span></a>
        <nav aria-label="Разделы приложения">
            <a href="#/" aria-current={active === 'linear' ? 'page' : undefined}>Линейный раскрой</a>
            <a href="#/double" aria-current={active === 'sheet' ? 'page' : undefined}>Двумерный раскрой</a>
        </nav>
        {desktop.available && <div className="desktop-tools">
            <button type="button" onClick={desktop.openHistory}>История</button>
            <button type="button" onClick={desktop.openAbout}>Справка</button>
            <button type="button" onClick={() => desktop.exit(draft)}>Выход</button>
        </div>}
    </header>;
}
