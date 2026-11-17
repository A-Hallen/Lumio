/** Minutos de un tramo: el dia se divide en tramos de 3 horas, como la tabla oficial. */
export const SLOT_MIN = 180;
const DAY_MIN = 24 * 60;

const RANGE = /(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/g;

const pad = (n: number) => String(n).padStart(2, '0');
const hhmm = (min: number) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;

/** "09:00-15:00" -> indices de los tramos que cubre. Lanza si no encaja exactamente en tramos de 3 horas. */
export function rangeToSlots(range: string): number[] {
  const m = /^\s*(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})\s*$/.exec(range);
  if (!m) throw new Error(`rango "${range}" mal escrito (debe ser HH:MM-HH:MM)`);
  let start = Number(m[1]) * 60 + Number(m[2]);
  let end = Number(m[3]) * 60 + Number(m[4]);
  // La tabla oficial escribe el dia como 00:01 - 23:59.
  if (start <= 1) start = 0;
  if (end >= DAY_MIN - 1) end = DAY_MIN;
  if (start % SLOT_MIN || end % SLOT_MIN || start >= end || end > DAY_MIN) {
    throw new Error(`rango "${range}" no encaja en los tramos de 3 horas`);
  }
  const out: number[] = [];
  for (let s = start / SLOT_MIN; s < end / SLOT_MIN; s++) out.push(s);
  return out;
}

/** Inverso: tramos con luz -> rangos unidos, escritos como en la tabla (00:01 ... 23:59). */
export function slotsToRanges(lit: boolean[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < lit.length; i++) {
    if (!lit[i]) continue;
    let j = i;
    while (j + 1 < lit.length && lit[j + 1]) j++;
    const a = i === 0 ? '00:01' : hhmm(i * SLOT_MIN);
    const b = j + 1 === lit.length ? '23:59' : hhmm((j + 1) * SLOT_MIN);
    out.push(`${a}-${b}`);
    i = j;
  }
  return out;
}

export type CircuitTable = {
  circuits: number[];
  /** dia del mes -> circuito -> rangos con luz (lista vacia = sin luz ese dia). */
  days: Record<string, Record<string, string[]>>;
};

/**
 * Lee la tabla tal como la publica la empresa, copiada a texto:
 *
 *   CTO 1
 *   17 - 21 - 25 - 29    09:00 - 15:00
 *   18 - 22 - 26 - 30    00:01 - 03:00 y 15:00 - 18:00
 *   CTO 20 y 21
 *   ...
 *
 * Una linea "CTO ..." abre un bloque (puede nombrar varios circuitos: comparten las mismas filas).
 * Cada fila empieza con los dias y sigue con uno o mas rangos; sin rangos significa que ese dia no hay luz.
 */
export function parseCircuitTable(text: string): CircuitTable {
  const circuits = new Set<number>();
  const days: CircuitTable['days'] = {};
  let block: number[] | null = null;

  text.split('\n').forEach((raw, n) => {
    const line = raw.replace(/#.*/, '').trim();
    if (!line) return;
    const fail = (why: string): never => {
      throw new Error(`linea ${n + 1}: ${why}`);
    };
    const head = /^cto\b(.*)$/i.exec(line);
    if (head) {
      block = (head[1].match(/\d+/g) ?? []).map(Number);
      if (!block.length) fail('"CTO" sin numero de circuito');
      block.forEach((c) => circuits.add(c));
      return;
    }
    if (!block) return fail('la fila va antes de cualquier "CTO"');
    const firstTime = line.search(/\d{1,2}:\d{2}/);
    const daysPart = firstTime < 0 ? line : line.slice(0, firstTime);
    const rowDays = (daysPart.match(/\d+/g) ?? []).map(Number);
    if (!rowDays.length) fail('no hay dias en la fila');
    const ranges = firstTime < 0 ? [] : [...line.slice(firstTime).matchAll(RANGE)].map((m) => `${pad(Number(m[1]))}:${m[2]}-${pad(Number(m[3]))}:${m[4]}`);
    for (const d of rowDays) {
      if (d < 1 || d > 31) fail(`dia ${d} fuera de 1-31`);
      for (const c of block) {
        const cell = ((days[String(d)] ??= {})[String(c)] ??= []);
        cell.push(...ranges);
      }
    }
  });
  return { circuits: [...circuits].sort((a, b) => a - b), days };
}
