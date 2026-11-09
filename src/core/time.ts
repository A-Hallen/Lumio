export type TimeFormat = '12' | '24';

/** Por defecto 12 horas con am/pm; la persona puede cambiarlo en Ajustes. */
export const DEFAULT_TIME_FORMAT: TimeFormat = '12';

export function parseTimeFormat(raw: string | null): TimeFormat {
  return raw === '24' || raw === '12' ? raw : DEFAULT_TIME_FORMAT;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Minuto del dia (0 a 1440) como hora legible. 24 h: "21:00". 12 h: "9:00 pm". El 1440 es la medianoche del final del dia. */
export function formatHour(min: number, fmt: TimeFormat = '24'): string {
  const { main, suffix } = hourParts(min, fmt);
  return suffix ? `${main} ${suffix}` : main;
}

/** La hora separada en cifras y sufijo (am/pm), para poder dibujar el sufijo mas pequeno. */
export function hourParts(min: number, fmt: TimeFormat): { main: string; suffix: string } {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  if (fmt === '24') return { main: `${pad(h)}:${pad(m)}`, suffix: '' };
  return { main: `${h % 12 === 0 ? 12 : h % 12}:${pad(m)}`, suffix: h < 12 ? 'am' : 'pm' };
}

/**
 * Rango corto para espacios justos, como el widget. 12 h: "3–6 am", "9 am–1 pm", "9 pm–12 am".
 * 24 h: "03:00–06:00". El am/pm se escribe solo donde hace falta.
 */
export function compactRange(startMin: number, endMin: number, fmt: TimeFormat): string {
  if (fmt === '24') return `${formatHour(startMin, '24')}–${formatHour(endMin, '24')}`;
  const a = hourParts(startMin, '12');
  const b = hourParts(endMin, '12');
  const short = (main: string) => main.replace(/:00$/, '');
  return a.suffix === b.suffix ? `${short(a.main)}–${short(b.main)} ${b.suffix}` : `${short(a.main)} ${a.suffix}–${short(b.main)} ${b.suffix}`;
}

/** Rotulos de las cinco marcas del abanico (00, 06, 12, 18 y 24 h). */
export const dialLabels = (fmt: TimeFormat): string[] =>
  fmt === '24' ? ['00', '06', '12', '18', '24'] : ['12 am', '6 am', '12 pm', '6 pm', '12 am'];
