import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseCircuitTable, rangeToSlots, slotsToRanges } from '../ranges.ts';
import { validateSchedule } from '../validate.ts';
import { segmentsForDay, type MonthSchedule } from '../schedule.ts';

test('rangos de la tabla -> tramos', () => {
  assert.deepEqual(rangeToSlots('09:00-15:00'), [3, 4]);
  assert.deepEqual(rangeToSlots('00:01-03:00'), [0]);
  assert.deepEqual(rangeToSlots('21:00-23:59'), [7]);
  assert.deepEqual(rangeToSlots('6:00 - 9:00'), [2]);
  assert.deepEqual(rangeToSlots('00:00-24:00'), [0, 1, 2, 3, 4, 5, 6, 7]);
});

test('un rango que no encaja en tramos de 3 h se rechaza con un mensaje claro', () => {
  assert.throws(() => rangeToSlots('09:30-12:00'), /no encaja/);
  assert.throws(() => rangeToSlots('15:00-09:00'), /no encaja/);
  assert.throws(() => rangeToSlots('de 9 a 3'), /mal escrito/);
});

test('tramos -> rangos unidos, escritos como la tabla', () => {
  assert.deepEqual(slotsToRanges([false, false, false, true, true, false, false, false]), ['09:00-15:00']);
  assert.deepEqual(slotsToRanges([true, false, false, false, false, true, false, false]), ['00:01-03:00', '15:00-18:00']);
  assert.deepEqual(slotsToRanges([false, false, false, false, false, false, false, true]), ['21:00-23:59']);
  assert.deepEqual(slotsToRanges(Array(8).fill(false)), []);
});

const TABLE = `
# CTO 1 y CTO 20 y 21 de la tabla vigente
CTO 1
17 - 21 - 25 - 29      09:00 - 15:00
18 - 22 - 26 - 30      00:01 - 03:00 y 15:00 - 18:00
CTO 20 y 21
17 - 21 - 25 - 29      06:00 - 9:00 y 21:00 - 23:59
18 - 22 - 26 - 30      12:00 - 15:00
`;

test('parseCircuitTable lee la tabla pegada tal cual y reparte los circuitos que comparten fila', () => {
  const t = parseCircuitTable(TABLE);
  assert.deepEqual(t.circuits, [1, 20, 21]);
  assert.deepEqual(t.days['17']['1'], ['09:00-15:00']);
  assert.deepEqual(t.days['30']['1'], ['00:01-03:00', '15:00-18:00']);
  assert.deepEqual(t.days['25']['20'], ['06:00-09:00', '21:00-23:59']);
  assert.deepEqual(t.days['25']['21'], t.days['25']['20']);
});

test('parseCircuitTable: una fila sin horas es un dia sin luz; errores con numero de linea', () => {
  assert.deepEqual(parseCircuitTable('CTO 3\n5').days['5']['3'], []);
  assert.throws(() => parseCircuitTable('17 09:00-12:00'), /linea 1/);
  assert.throws(() => parseCircuitTable('CTO\n'), /linea 1/);
  assert.throws(() => parseCircuitTable('CTO 1\n40 09:00-12:00'), /fuera de 1-31/);
});

const base = (days: unknown, circuits = [1, 2]) => ({
  version: 2,
  month: '2026-02',
  timezone: 'America/Havana',
  meaning: 'light',
  slots: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
  circuits,
  days,
});
const febDays = (f: (d: number) => Record<string, string[]>) => Object.fromEntries(Array.from({ length: 28 }, (_, i) => [String(i + 1), f(i + 1)]));

test('el formato por circuito se valida y funciona en el motor, con circuitos que comparten tramo o sin luz', () => {
  const s = validateSchedule(base(febDays(() => ({ '1': ['00:01-03:00', '09:00-15:00'], '2': ['09:00-15:00'] }))));
  const light = (c: number) => segmentsForDay(s, c, 5).filter((x) => x.hasLight).map((x) => [x.startMin / 60, Math.round(x.endMin / 60)]);
  assert.deepEqual(light(1), [[0, 3], [9, 15]]);
  assert.deepEqual(light(2), [[9, 15]]); // los dos con luz a la vez, sin problema
});

test('un dia sin luz para nadie en un tramo es valido (celda vacia)', () => {
  const s = validateSchedule(base(febDays(() => ({ '1': [], '2': [] }))));
  assert.deepEqual(segmentsForDay(s, 1, 3), [{ startMin: 0, endMin: 1440, hasLight: false }]);
});

test('el formato por circuito rechaza datos incompletos o inventados', () => {
  assert.throws(() => validateSchedule(base(febDays(() => ({ '1': ['09:00-15:00'] })))), /circuito 2 sin datos/);
  assert.throws(() => validateSchedule(base(febDays(() => ({ '1': [], '2': [], '7': [] })))), /circuito desconocido 7/);
  assert.throws(() => validateSchedule(base(febDays(() => ({ '1': ['09:30-12:00'], '2': [] })))), /no encaja/);
  assert.throws(() => validateSchedule(base({ '1': { '1': [], '2': [] } })), /dia 2/);
});

test('los dos formatos dan el mismo resultado: el mes real, escrito por circuito, equivale al de tramos', () => {
  const nov = JSON.parse(readFileSync(new URL('../../../schedule/2026-11.json', import.meta.url), 'utf8')) as MonthSchedule;
  const grid = validateSchedule(nov);
  const byCircuit = validateSchedule({
    ...nov,
    version: 2,
    days: Object.fromEntries(
      Object.entries(grid.days).map(([d, row]) => [
        d,
        Object.fromEntries(nov.circuits.map((c) => [String(c), slotsToRanges(row.map((cell) => (Array.isArray(cell) ? cell.includes(c) : cell === c)))])),
      ]),
    ),
  });
  for (const c of nov.circuits) for (let d = 1; d <= 30; d++) assert.deepEqual(segmentsForDay(byCircuit, c, d), segmentsForDay(grid, c, d), `cto ${c} dia ${d}`);
});
