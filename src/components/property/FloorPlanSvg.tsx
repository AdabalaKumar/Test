import { LAYOUTS, roomAreaSqft, type Edge } from '@/lib/layouts';
import type { LayoutKey } from '@/lib/types';

const S = 40; // px per metre

function EdgeLine({ kind, x1, y1, x2, y2 }: { kind: Edge; x1: number; y1: number; x2: number; y2: number }) {
  if (kind === 'none') return null;
  if (kind === 'glass') return <g><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0d0d0f" strokeWidth={7} /><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c9a96e" strokeWidth={2} /></g>;
  if (kind === 'rail') return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c9a96e" strokeWidth={1.5} strokeDasharray="6 4" />;
  if (kind === 'door') {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const gap = Math.min(S, len * 0.4);
    const t0 = (len - gap) / 2 / len, t1 = (len + gap) / 2 / len;
    const at = (t: number) => [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];
    const [ax, ay] = at(t0), [bx, by] = at(t1);
    const horizontal = y1 === y2;
    return (
      <g stroke="#f4efe6" fill="none">
        <line x1={x1} y1={y1} x2={ax} y2={ay} strokeWidth={5} /><line x1={bx} y1={by} x2={x2} y2={y2} strokeWidth={5} />
        <path d={horizontal ? `M${ax} ${ay} A${gap} ${gap} 0 0 1 ${bx} ${by + gap} L${bx} ${by}` : `M${ax} ${ay} A${gap} ${gap} 0 0 0 ${bx + gap} ${by} L${bx} ${by}`} strokeWidth={0.8} opacity={0.5} />
      </g>
    );
  }
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f4efe6" strokeWidth={5} strokeLinecap="square" />;
}

/** Architectural floor plan drawn from the same room data as the 3D interior, so the two always agree. */
export default function FloorPlanSvg({ layout, className = '' }: { layout: LayoutKey; className?: string }) {
  const L = LAYOUTS[layout];
  const pad = 46;
  const W = L.width * S + pad * 2, H = L.depth * S + pad * 2 + 10;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label={`${L.label} floor plan`}>
      <defs>
        <pattern id={`grid-${layout}`} width={S} height={S} patternUnits="userSpaceOnUse"><path d={`M${S} 0H0V${S}`} fill="none" stroke="#fff" strokeOpacity=".04" /></pattern>
        <pattern id={`deck-${layout}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="#c9a96e" strokeOpacity=".22" /></pattern>
      </defs>
      <rect width={W} height={H} fill="#141416" />
      <rect width={W} height={H} fill={`url(#grid-${layout})`} />
      <g transform={`translate(${pad} ${pad})`}>
        {L.rooms.map((r) => (
          <g key={r.id}>
            <rect x={r.x * S} y={r.z * S} width={r.w * S} height={r.d * S} fill={r.type === 'terrace' ? `url(#deck-${layout})` : r.type === 'bath' ? '#1f2326' : '#1b1b1e'} />
            <text x={(r.x + r.w / 2) * S} y={(r.z + r.d / 2) * S - 3} textAnchor="middle" fill="#f4efe6" fontSize={r.w < 2 ? 8 : 10.5} letterSpacing="1.4" style={{ textTransform: 'uppercase', fontFamily: 'inherit' }}>{r.w < 2 ? r.name.split(' ')[0] : r.name}</text>
            <text x={(r.x + r.w / 2) * S} y={(r.z + r.d / 2) * S + 13} textAnchor="middle" fill="#c9a96e" fontSize="9.5">{r.w < 2 ? `${roomAreaSqft(r)}` : `${r.w.toFixed(1)} × ${r.d.toFixed(1)} m · ${roomAreaSqft(r)} sq ft`}</text>
          </g>
        ))}
        {L.rooms.map((r) => (
          <g key={r.id}>
            <EdgeLine kind={r.edges.n} x1={r.x * S} y1={r.z * S} x2={(r.x + r.w) * S} y2={r.z * S} />
            <EdgeLine kind={r.edges.s} x1={r.x * S} y1={(r.z + r.d) * S} x2={(r.x + r.w) * S} y2={(r.z + r.d) * S} />
            <EdgeLine kind={r.edges.w} x1={r.x * S} y1={r.z * S} x2={r.x * S} y2={(r.z + r.d) * S} />
            <EdgeLine kind={r.edges.e} x1={(r.x + r.w) * S} y1={r.z * S} x2={(r.x + r.w) * S} y2={(r.z + r.d) * S} />
          </g>
        ))}
        {/* Dimension line and north arrow */}
        <g stroke="#c9a96e" strokeWidth=".8" fill="#c9a96e" fontSize="9.5">
          <line x1={0} y1={L.depth * S + 22} x2={L.width * S} y2={L.depth * S + 22} />
          <line x1={0} y1={L.depth * S + 17} x2={0} y2={L.depth * S + 27} /><line x1={L.width * S} y1={L.depth * S + 17} x2={L.width * S} y2={L.depth * S + 27} />
          <text x={(L.width * S) / 2} y={L.depth * S + 38} textAnchor="middle" stroke="none">{L.width.toFixed(1)} m</text>
        </g>
        <g transform={`translate(${L.width * S + 20} 6)`} stroke="#c9a96e" fill="none" strokeWidth=".8"><circle r="11" /><path d="M0 7V-7M-4 -2 0 -7 4 -2" /><text y="-15" textAnchor="middle" fill="#c9a96e" stroke="none" fontSize="8">N</text></g>
      </g>
    </svg>
  );
}
