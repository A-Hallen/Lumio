import type { MonthSchedule } from './schedule.ts';

const daysInMonth = (month: string) => {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m, 0).getDate();
};

/** Lanza si el JSON no es un horario completo y coherente; un horario roto nunca debe pisar uno bueno. */
export function validateSchedule(x: unknown): MonthSchedule {
  const fail = (why: string): never => {
    throw new Error(`horario invalido: ${why}`);
  };
  if (!x || typeof x !== 'object') return fail('no es un objeto');
  const s = x as Partial<MonthSchedule>;
  if (typeof s.month !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(s.month)) return fail('mes');
  if (s.meaning !== 'light' && s.meaning !== 'outage') return fail('significado');
  if (!Array.isArray(s.slots) || s.slots.length === 0) return fail('tramos');
  if (!Array.isArray(s.circuits) || s.circuits.length === 0 || !s.circuits.every(Number.isInteger)) return fail('circuitos');
  if (!s.days || typeof s.days !== 'object') return fail('dias');
  for (let d = 1; d <= daysInMonth(s.month); d++) {
    const row = s.days[String(d)];
    if (!Array.isArray(row) || row.length !== s.slots.length) return fail(`dia ${d}`);
    if (!row.every((c) => s.circuits!.includes(c))) return fail(`circuito desconocido en el dia ${d}`);
  }
  return s as MonthSchedule;
}
