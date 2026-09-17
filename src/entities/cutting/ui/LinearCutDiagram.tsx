import {formatNumber, groupRows} from 'shared/lib';
import type {LinearCutResult, CuttingAngle} from '../model/types';

interface Props {result: LinearCutResult; thickness: number; angle: CuttingAngle}
export function LinearCutDiagram({result, thickness, angle}: Props) {
    // Include stock length when grouping: equal cut lists can belong to different stock.
    const patterns = groupRows(result.result_maps.map((row, index) => [result.stock_lengths[index], ...row]));
    return <div className="cut-diagrams">
        {patterns.map((row, index) => {
            const stock = row[0];
            const count = row[row.length - 1];
            const remainder = row[row.length - 2];
            const pieces = row.slice(1, -2);
            const total = pieces.reduce((sum, length) => sum + length, 0) + remainder;
            let x = 0;
            return <figure className="cut-diagram" key={index}>
                <figcaption>Карта {index + 1} · {formatNumber(stock)} мм · повторить {count} раз · остаток {formatNumber(remainder)} мм</figcaption>
                <svg viewBox="0 0 1000 75" role="img" aria-label={`Карта ${index + 1}, остаток ${formatNumber(remainder)} мм`}>
                    {pieces.map((length, pieceIndex) => {
                        const width = length / total * 1000;
                        const left = x;
                        x += width;
                        const slope = Math.min(width / 4, thickness * Math.tan(angle * Math.PI / 180) / total * 1000);
                        const points = pieceIndex % 2 === 0
                            ? `${left},8 ${x},8 ${x - slope},48 ${left + slope},48`
                            : `${left + slope},8 ${x - slope},8 ${x},48 ${left},48`;
                        return <g key={pieceIndex}><title>{formatNumber(length)} мм</title>
                            <polygon points={points} fill={pieceIndex % 2 ? '#209b90' : '#087f76'} stroke="white"/>
                            {width >= 32 && <text x={left + width / 2} y="32" textAnchor="middle" fill="white" fontSize="12">{formatNumber(length)}</text>}
                        </g>;
                    })}
                    {remainder > 0 && <rect x={x} y="8" width={remainder / total * 1000} height="40" fill="#d3dce5"><title>Остаток {formatNumber(remainder)} мм</title></rect>}
                </svg>
            </figure>;
        })}
        <p className="muted">Зелёным показаны детали, серым — остаток. Схема условная, размеры указаны в миллиметрах.</p>
    </div>;
}
