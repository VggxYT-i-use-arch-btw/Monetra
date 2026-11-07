import { useState } from 'react';
import { formatBRL, formatDate } from '../domain/formatting';
import type { PricePoint } from '../domain/types';

function pointPath(points: PricePoint[], low: number, high: number): string {
  return points.map((point, index) => {
    const x = index * 400 / Math.max(1, points.length - 1);
    const y = 160 - ((point.price - low) / Math.max(1, high - low)) * 140;
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
}

export function PriceChart({
  points,
  productName,
  trackedDays,
  fromPrice,
}: {
  points: PricePoint[];
  productName: string;
  trackedDays: number;
  fromPrice?: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const prices = points.map((point) => point.price);
  const low = prices.length ? Math.min(...prices) : 0;
  const high = prices.length ? Math.max(...prices) : 1;
  const path = pointPath(points, low, high);
  const selected = hovered === null ? undefined : points[hovered];
  const referenceY = fromPrice === undefined
    ? undefined
    : 160 - ((fromPrice - low) / Math.max(1, high - low)) * 140;

  function movePointer(event: React.PointerEvent<SVGSVGElement>) {
    if (points.length < 2) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    setHovered(Math.round(ratio * (points.length - 1)));
  }

  return (
    <div className="chart-frame">
      <div className="chart-y-labels" aria-hidden="true">
        <span>{formatBRL(high)}</span>
        <span>{formatBRL((low + high) / 2)}</span>
        <span>{formatBRL(low)}</span>
      </div>
      <svg
        className="price-chart"
        viewBox="0 0 400 180"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Histórico de preços de ${productName}`}
        tabIndex={0}
        onPointerMove={movePointer}
        onPointerLeave={() => setHovered(null)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') {
            setHovered((current) => Math.min(points.length - 1, (current ?? -1) + 1));
          }
          if (event.key === 'ArrowLeft') {
            setHovered((current) => Math.max(0, (current ?? points.length) - 1));
          }
        }}
      >
        <defs>
          <pattern id="chart-hatch" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="var(--tertiary)" strokeWidth="2" />
          </pattern>
        </defs>
        <path className="chart-grid" d="M0 20H400M0 90H400M0 160H400M133 20V160M267 20V160" />
        {trackedDays < 14 ? (
          <>
            <rect x="0" y="88" width="400" height="20" fill="url(#chart-hatch)" opacity=".55" />
            <path className="chart-line" d="M0 98H400" />
            {points.map((point, index) => (
              <circle key={point.date} className="chart-dot" cx={index * 400 / Math.max(1, points.length - 1)} cy="98" r="4" />
            ))}
          </>
        ) : (
          <>
            <path className="chart-area" d={`${path} L400 160 L0 160 Z`} />
            {fromPrice !== undefined && referenceY !== undefined && (
              <>
                <path className="chart-reference" d={`M0 ${referenceY}H400`} />
                <text className="chart-reference-label" x="392" y={Math.max(14, referenceY - 5)} textAnchor="end">Referência</text>
              </>
            )}
            <path className="chart-line" d={path} />
            {selected && (
              <>
                <path className="chart-crosshair" d={`M${hovered! * 400 / Math.max(1, points.length - 1)} 0V160`} />
                <circle className="chart-dot" cx={hovered! * 400 / Math.max(1, points.length - 1)} cy={160 - ((selected.price - low) / Math.max(1, high - low)) * 140} r="4" />
              </>
            )}
          </>
        )}
      </svg>
      {trackedDays < 14 ? (
        <p className="chart-note">Ainda coletando dados deste produto.</p>
      ) : selected ? (
        <div className="chart-tooltip">
          <strong>{formatBRL(selected.price)}</strong>
          <small>{formatDate(selected.date)}</small>
        </div>
      ) : null}
      <div className="chart-x-labels">
        <span>{formatDate(points[0]?.date)}</span>
        <span>{formatDate(points[Math.floor(points.length / 2)]?.date)}</span>
        <span>{formatDate(points.at(-1)?.date)}</span>
      </div>
    </div>
  );
}
