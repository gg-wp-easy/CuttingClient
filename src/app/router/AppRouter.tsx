import {lazy, Suspense, useEffect, useState} from 'react';
const LinearCutPage = lazy(() => import('pages/linear-cut').then(module => ({default: module.LinearCutPage})));
const SheetCutPage = lazy(() => import('pages/sheet-cut').then(module => ({default: module.SheetCutPage})));

export function AppRouter() {
    const [route, setRoute] = useState(window.location.hash);
    useEffect(() => {
        const navigate = (): void => setRoute(window.location.hash);
        window.addEventListener('hashchange', navigate);
        return () => window.removeEventListener('hashchange', navigate);
    }, []);
    return <Suspense fallback={<p role="status">Загрузка…</p>}>
        {route === '#/double' ? <SheetCutPage/> : <LinearCutPage/>}
    </Suspense>;
}
