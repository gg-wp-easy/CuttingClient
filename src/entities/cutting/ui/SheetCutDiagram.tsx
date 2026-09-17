import type {SheetPiece} from '../model/types';
import {formatNumber} from 'shared/lib';

export function SheetCutDiagram({pieces}: {pieces: SheetPiece[]}) {
    // The current service returns piece sizes/counts, not placement coordinates.
    return <div className="sheet-pieces">{pieces.map(([height, width, count], index) =>
        <figure className="cut-diagram" key={index}>
            <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Деталь ${height} на ${width} мм`}>
                <rect width={width} height={height} fill="#087f76"/>
            </svg>
            <figcaption>{formatNumber(height)} × {formatNumber(width)} мм · {count} шт.</figcaption>
        </figure>)}</div>;
}
