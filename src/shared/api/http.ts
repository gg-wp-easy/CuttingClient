const API_URL = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || 'http://localhost:8000';

export async function postJson(path: string, body: unknown, signal?: AbortSignal): Promise<unknown> {
    let response: Response;
    try {
        response = await fetch(`${API_URL}${path}`, {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body), signal,
        });
    } catch (error) {
        if (signal?.aborted) throw error;
        throw new Error('Служба раскроя недоступна. Проверьте, что сервер запущен.');
    }
    const data: unknown = await response.json();
    if (!response.ok) {
        const detail = typeof data === 'object' && data !== null && 'detail' in data
            ? (data as {detail: unknown}).detail : undefined;
        throw new Error(typeof detail === 'string' ? detail : 'Проверьте параметры раскроя.');
    }
    return data;
}
