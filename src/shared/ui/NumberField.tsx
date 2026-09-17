import {useId} from 'react';

interface NumberFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    min?: number;
    step?: number | 'any';
}
export function NumberField({label, value, onChange, min = 0, step = 1}: NumberFieldProps) {
    const id = useId();
    return <label className="field" htmlFor={id}>
        <span>{label}</span>
        <input id={id} type="number" value={value} min={min} step={step}
            onChange={event => onChange(event.target.value)} required/>
    </label>;
}
