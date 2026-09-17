import {useCallback, useEffect, useRef, useState} from 'react';
import {calculateLinear, calculateSheet, validateLinearRequest, validateSheetRequest} from 'entities/cutting';
import type {LinearCutRequest, SheetCutRequest} from 'entities/cutting';

function useCalculation<Request, Result>(
    validate: (request: Request) => void,
    calculate: (request: Request, signal: AbortSignal) => Promise<Result>,
) {
    const [completed, setCompleted] = useState<{request: Request; result: Result} | null>(null);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const active = useRef<AbortController | null>(null);
    useEffect(() => () => active.current?.abort(), []);
    const run = useCallback(async (request: Request): Promise<void> => {
        active.current?.abort();
        const controller = new AbortController();
        active.current = controller;
        setError(null);
        setCompleted(null);
        setPending(true);
        try {
            validate(request);
            const result = await calculate(request, controller.signal);
            if (!controller.signal.aborted) setCompleted({request, result});
        } catch (failure) {
            if (!controller.signal.aborted) {
                setError(failure instanceof Error ? failure.message : 'Не удалось выполнить расчёт.');
            }
        } finally {
            if (active.current === controller && !controller.signal.aborted) setPending(false);
        }
    }, [validate, calculate]);
    return {completed, pending, error, run};
}
export const useLinearCalculation = () => useCalculation<LinearCutRequest, Awaited<ReturnType<typeof calculateLinear>>>(validateLinearRequest, calculateLinear);
export const useSheetCalculation = () => useCalculation<SheetCutRequest, Awaited<ReturnType<typeof calculateSheet>>>(validateSheetRequest, calculateSheet);
