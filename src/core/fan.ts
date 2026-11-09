export type FanGeometry = { cx: number; cy: number; rOuter: number; rInner: number };
export type Wedge = { d: string; hasLight: boolean; isCurrent: boolean; index: number };

const rad = (deg: number) => (deg * Math.PI) / 180;
const f = (n: number) => n.toFixed(2);
// El abanico es un semicirculo: 00:00 a la izquierda (180 grados), 24:00 a la derecha (0 grados).
const point = (g: FanGeometry, r: number, deg: number) => ({ x: g.cx + r * Math.cos(rad(deg)), y: g.cy - r * Math.sin(rad(deg)) });

/** Un cristal por tramo, como sector de anillo. `lightPerSlot` trae un booleano por tramo. */
export function fanWedges(g: FanGeometry, lightPerSlot: boolean[], currentSlot: number): Wedge[] {
  const step = 180 / lightPerSlot.length;
  return lightPerSlot.map((hasLight, i) => {
    const a0 = 180 - i * step;
    const a1 = 180 - (i + 1) * step;
    const o0 = point(g, g.rOuter, a0);
    const o1 = point(g, g.rOuter, a1);
    const i1 = point(g, g.rInner, a1);
    const i0 = point(g, g.rInner, a0);
    const d =
      `M ${f(o0.x)} ${f(o0.y)} A ${g.rOuter} ${g.rOuter} 0 0 1 ${f(o1.x)} ${f(o1.y)} ` +
      `L ${f(i1.x)} ${f(i1.y)} A ${g.rInner} ${g.rInner} 0 0 0 ${f(i0.x)} ${f(i0.y)} Z`;
    return { d, hasLight, isCurrent: i === currentSlot, index: i };
  });
}

/** Punto del borde exterior que corresponde a un minuto del dia (0..1440). */
export function needlePoint(g: FanGeometry, minute: number) {
  return point(g, g.rOuter, 180 - (180 * minute) / 1440);
}

export function needleInner(g: FanGeometry, minute: number) {
  return point(g, g.rInner, 180 - (180 * minute) / 1440);
}
