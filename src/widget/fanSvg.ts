import { fanWedges, needleInner, needlePoint } from '../core/fan';
import { color } from '../theme/tokens';

/** Abanico como texto SVG para el widget (el widget no usa react-native-svg). */
export function fanSvg(w: number, lightPerSlot: boolean[], currentSlot: number, nowMinute: number): string {
  const rOuter = w / 2 - 6;
  const g = { cx: w / 2, cy: rOuter + 6, rOuter, rInner: rOuter * 0.36 };
  const h = g.cy + 8;
  const panes = fanWedges(g, lightPerSlot, currentSlot)
    .map(
      (p) =>
        `<path d="${p.d}" fill="${p.hasLight ? color.glassOn : color.glassOff}" stroke="${color.line}" stroke-width="2.5" stroke-linejoin="round"/>` +
        (p.hasLight ? '' : `<path d="${p.d}" fill="none" stroke="${color.glassOffEdge}" stroke-width="1" stroke-dasharray="2 3" opacity="0.8"/>`) +
        (p.isCurrent ? `<path d="${p.d}" fill="none" stroke="${color.cal}" stroke-width="2"/>` : ''),
    )
    .join('');
  const a = needleInner(g, nowMinute);
  const b = needlePoint({ ...g, rOuter: g.rOuter + 2 }, nowMinute);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${panes}` +
    `<path d="M ${g.cx - g.rInner} ${g.cy} A ${g.rInner} ${g.rInner} 0 0 1 ${g.cx + g.rInner} ${g.cy} Z" fill="${color.lead}" stroke="${color.line}" stroke-width="2.5"/>` +
    `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${color.line}" stroke-width="5" stroke-linecap="round"/>` +
    `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${color.cal}" stroke-width="2.4" stroke-linecap="round"/></svg>`
  );
}
