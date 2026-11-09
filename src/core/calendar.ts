import type { MonthSchedule } from './schedule.ts';

export const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
export const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

const split = (key: string) => {
  const [y, m] = key.split('-').map(Number);
  return { year: y, month0: m - 1 };
};

/** "2026-11" -> "noviembre 2026". */
export const monthTitle = (key: string) => {
  const { year, month0 } = split(key);
  return `${MONTHS[month0]} ${year}`;
};

/** Clave "AAAA-MM" del mes de una fecha. */
export const monthKeyOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

/** Semanas del mes con la semana empezando en lunes; null rellena los huecos de la primera y la ultima fila. */
export function monthGrid(key: string): (number | null)[][] {
  const { year, month0 } = split(key);
  const lead = (new Date(year, month0, 1).getDay() + 6) % 7;
  const count = new Date(year, month0 + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, r) => cells.slice(r * 7, r * 7 + 7));
}

/** Dias del mes que tienen horario cargado. */
export const availableDays = (s: MonthSchedule): number[] =>
  Object.keys(s.days)
    .map(Number)
    .sort((a, b) => a - b);

/** El dia con horario mas cercano al preferido (el propio si lo tiene); null si el mes no tiene ninguno. */
export function nearestDay(s: MonthSchedule, preferred: number): number | null {
  const days = availableDays(s);
  if (!days.length) return null;
  return days.reduce((best, d) => (Math.abs(d - preferred) < Math.abs(best - preferred) ? d : best));
}
