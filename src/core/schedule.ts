export type MonthSchedule = {
  version: number;
  month: string; // "2026-11"
  timezone: string;
  /** "light": el circuito que aparece en la celda TIENE luz en ese tramo. */
  meaning: 'light' | 'outage';
  updatedAt?: string;
  slots: string[];
  circuits: number[];
  days: Record<string, number[]>; // dia del mes -> circuito por tramo
};

export type Segment = { startMin: number; endMin: number; hasLight: boolean };

export type Status = {
  /** false si no hay horario cargado para el mes actual. */
  covered: boolean;
  hasLight: boolean;
  /** Proximo cambio, o null si los datos se acaban antes de que cambie. */
  until: Date | null;
  remainingMs: number | null;
  /** false cuando `until` es solo el final de los datos y no un cambio real. */
  untilKnown: boolean;
};

const SLOT_MIN = 180;

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

function lightPerSlot(s: MonthSchedule, circuit: number, day: number): boolean[] | null {
  const row = s.days[String(day)];
  if (!row) return null;
  return row.map((c) => (c === circuit) === (s.meaning === 'light'));
}

/** Tramos del dia con luz / sin luz, ya unidos si son contiguos. */
export function segmentsForDay(s: MonthSchedule, circuit: number, day: number): Segment[] {
  const slots = lightPerSlot(s, circuit, day);
  if (!slots) return [];
  const out: Segment[] = [];
  slots.forEach((hasLight, i) => {
    const last = out[out.length - 1];
    if (last && last.hasLight === hasLight) last.endMin = (i + 1) * SLOT_MIN;
    else out.push({ startMin: i * SLOT_MIN, endMin: (i + 1) * SLOT_MIN, hasLight });
  });
  return out;
}

/** Vista de un dia concreto (fecha completa) para un circuito; null si ese mes no esta cargado. */
export function dayView(schedules: MonthSchedule[], circuit: number, date: Date) {
  const s = schedules.find((m) => m.month === monthKey(date));
  const slots = s ? lightPerSlot(s, circuit, date.getDate()) : null;
  if (!s || !slots) return null;
  return { slots, segments: segmentsForDay(s, circuit, date.getDate()), slotLabels: s.slots };
}

const atMinute = (base: Date, min: number) =>
  new Date(base.getFullYear(), base.getMonth(), base.getDate(), 0, min);

export function getStatus(schedules: MonthSchedule[], circuit: number, now: Date): Status {
  const byMonth = new Map(schedules.map((s) => [s.month, s]));
  const here = byMonth.get(monthKey(now));
  const dayOf = (d: Date) => {
    const s = byMonth.get(monthKey(d));
    return s ? lightPerSlot(s, circuit, d.getDate()) : null;
  };
  const today = here ? lightPerSlot(here, circuit, now.getDate()) : null;
  if (!today) return { covered: false, hasLight: false, until: null, remainingMs: null, untilKnown: false };

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const hasLight = today[Math.min(Math.floor(nowMin / SLOT_MIN), today.length - 1)];

  // Recorre tramo a tramo hacia adelante hasta que el estado cambie.
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let slots: boolean[] | null = today;
  let slot = Math.floor(nowMin / SLOT_MIN) + 1;
  for (let guard = 0; guard < 400; guard++) {
    if (slot >= (slots?.length ?? 0)) {
      day.setDate(day.getDate() + 1);
      slots = dayOf(day);
      slot = 0;
      if (!slots) {
        // Se acabaron los datos: con luz, dura al menos hasta la medianoche del ultimo dia conocido.
        const end = atMinute(day, 0);
        return {
          covered: true,
          hasLight,
          until: hasLight ? end : null,
          remainingMs: hasLight ? end.getTime() - now.getTime() : null,
          untilKnown: false,
        };
      }
    }
    if (slots![slot] !== hasLight) {
      const until = atMinute(day, slot * SLOT_MIN);
      return { covered: true, hasLight, until, remainingMs: until.getTime() - now.getTime(), untilKnown: true };
    }
    slot++;
  }
  return { covered: true, hasLight, until: null, remainingMs: null, untilKnown: false };
}

export function formatDuration(ms: number): string {
  const total = Math.floor(ms / 60_000);
  if (total < 1) return 'menos de 1 min';
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

/** Hora legible de un minuto del dia; 24 h por defecto, o 12 h con am/pm. */
export { formatHour as hourLabel } from './time.ts';
