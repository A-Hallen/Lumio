import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { MonthSchedule } from '../schedule.ts';
import { availableDays, monthGrid, monthKeyOf, monthTitle, nearestDay } from '../calendar.ts';

const nov = JSON.parse(readFileSync(new URL('../../../schedule/2026-11.json', import.meta.url), 'utf8')) as MonthSchedule;

test('titulo del mes en español', () => {
  assert.equal(monthTitle('2026-11'), 'noviembre 2026');
  assert.equal(monthTitle('2027-01'), 'enero 2027');
  assert.equal(monthKeyOf(new Date(2026, 10, 8)), '2026-11');
});

test('la cuadricula de noviembre 2026 empieza en domingo, con la semana en lunes', () => {
  const g = monthGrid('2026-11');
  assert.ok(g.every((row) => row.length === 7));
  // 1 de noviembre de 2026 es domingo: seis huecos y el 1 en la ultima columna.
  assert.deepEqual(g[0], [null, null, null, null, null, null, 1]);
  assert.equal(g.flat().filter((d) => d !== null).length, 30);
  assert.equal(g.flat().filter((d) => d !== null).at(-1), 30);
});

test('un mes que empieza en lunes no lleva huecos al principio', () => {
  // 1 de junio de 2026 es lunes.
  assert.equal(monthGrid('2026-06')[0][0], 1);
});

test('dias con horario y el mas cercano al pedido', () => {
  assert.equal(availableDays(nov).length, 30);
  assert.equal(nearestDay(nov, 8), 8);
  const parcial = { ...nov, days: { '10': nov.days['10'], '11': nov.days['11'], '20': nov.days['20'] } };
  assert.equal(nearestDay(parcial, 9), 10);
  assert.equal(nearestDay(parcial, 31), 20);
  assert.equal(nearestDay({ ...nov, days: {} }, 5), null);
});
