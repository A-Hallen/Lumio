import { SLOT_MIN, rangeToSlots } from './ranges.ts';
import type { MonthSchedule, SlotCircuit } from './schedule.ts';

const daysInMonth = (month: string) => {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m, 0).getDate();
};

/**
 * Lanza si el JSON no es un horario completo y coherente; un horario roto nunca debe pisar uno bueno.
 *
 * Acepta dos formas de escribir los dias y siempre devuelve la misma por dentro (para cada dia, la lista de
 * circuitos con luz en cada tramo):
 *  - por tramo:    "17": [19, 2, [20, 21], 1, 1, 19, 2, [20, 21]]
 *  - por circuito: "17": { "1": ["09:00-15:00"], "20": ["06:00-09:00", "21:00-23:59"], ... }
 */
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
  const circuits = s.circuits;
  const known = (c: unknown) => Number.isInteger(c) && circuits.includes(c as number);

  const days: Record<string, SlotCircuit[]> = {};
  for (let d = 1; d <= daysInMonth(s.month); d++) {
    const row: unknown = (s.days as Record<string, unknown>)[String(d)];
    if (Array.isArray(row)) {
      if (row.length !== s.slots.length) return fail(`dia ${d}`);
      if (!row.every((c) => (Array.isArray(c) ? c.every(known) : known(c)))) return fail(`circuito desconocido en el dia ${d}`);
      days[String(d)] = row as SlotCircuit[];
    } else if (row && typeof row === 'object') {
      if (s.slots.length * SLOT_MIN !== 24 * 60) return fail('los horarios por circuito necesitan 8 tramos de 3 horas');
      const cells: number[][] = s.slots.map(() => []);
      const byCircuit = row as Record<string, unknown>;
      for (const key of Object.keys(byCircuit)) if (!known(Number(key))) return fail(`circuito desconocido ${key} en el dia ${d}`);
      for (const c of circuits) {
        const ranges = byCircuit[String(c)];
        if (!Array.isArray(ranges) || !ranges.every((r) => typeof r === 'string')) return fail(`dia ${d}, circuito ${c} sin datos`);
        try {
          for (const r of ranges as string[]) for (const i of rangeToSlots(r)) cells[i].push(c);
        } catch (e) {
          return fail(`dia ${d}, circuito ${c}: ${(e as Error).message}`);
        }
      }
      days[String(d)] = cells;
    } else {
      return fail(`dia ${d}`);
    }
  }
  return { ...(s as MonthSchedule), days };
}
