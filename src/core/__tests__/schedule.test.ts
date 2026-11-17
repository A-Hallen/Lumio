import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getStatus, segmentsForDay, dayView, formatDuration, type MonthSchedule } from '../schedule.ts';

const nov = JSON.parse(readFileSync(new URL('../../../schedule/2026-11.json', import.meta.url), 'utf8')) as MonthSchedule;
const at = (d: number, h: number, m = 0) => new Date(2026, 10, d, h, m);

// Dia 8, circuito 1: luz de 03:00 a 06:00 y de 18:00 a 21:00 (fila 8 de la tabla).
test('segmentos del dia 8 para el circuito 1', () => {
  const light = segmentsForDay(nov, 1, 8).filter((s) => s.hasLight);
  assert.deepEqual(light.map((s) => [s.startMin, s.endMin]), [[180, 360], [1080, 1260]]);
});

test('con luz: dice hasta cuando y cuanto falta', () => {
  const s = getStatus([nov], 1, at(8, 4, 36));
  assert.equal(s.hasLight, true);
  assert.equal(s.until?.getTime(), at(8, 6).getTime());
  assert.equal(s.remainingMs, 84 * 60_000);
  assert.equal(s.untilKnown, true);
});

test('sin luz: dice cuando vuelve', () => {
  const s = getStatus([nov], 1, at(8, 10));
  assert.equal(s.hasLight, false);
  assert.equal(s.until?.getTime(), at(8, 18).getTime());
});

test('el limite exacto ya pertenece al tramo nuevo', () => {
  assert.equal(getStatus([nov], 1, at(8, 6)).hasLight, false);
  assert.equal(getStatus([nov], 1, at(8, 3)).hasLight, true);
});

test('la luz que cruza la medianoche se une con el dia siguiente', () => {
  // dia 8 termina sin luz para el circuito 1; el 9 empieza con Cto 2, sin luz: proximo cambio el dia 9 a las 09:00.
  const s = getStatus([nov], 1, at(8, 21, 30));
  assert.equal(s.hasLight, false);
  assert.equal(s.until?.getTime(), at(9, 9).getTime());
});

test('fin de datos: no inventa el proximo cambio', () => {
  const s = getStatus([nov], 1, at(30, 22));
  assert.equal(s.hasLight, false);
  assert.equal(s.until, null);
  assert.equal(s.untilKnown, false);
});

test('mes sin horario cargado', () => {
  const s = getStatus([nov], 1, new Date(2026, 11, 3, 10));
  assert.equal(s.covered, false);
});

test('dayView da los 8 tramos y null fuera del horario cargado', () => {
  const v = dayView([nov], 1, at(8, 12));
  assert.deepEqual(v?.slots, [false, true, false, false, false, false, true, false]);
  assert.equal(dayView([nov], 1, new Date(2026, 11, 3)), null);
});

test('formato de duracion', () => {
  assert.equal(formatDuration(84 * 60_000), '1 h 24 min');
  assert.equal(formatDuration(60 * 60_000), '1 h');
  assert.equal(formatDuration(45 * 60_000), '45 min');
  assert.equal(formatDuration(20_000), 'menos de 1 min');
});

// Tabla vigente desde el 17 de noviembre (UNE Holguin): "CTO 20 y 21" comparten tramos.
test('desde el 17 de noviembre: horas con luz de cada circuito segun la tabla', () => {
  const hours = (c: number, d: number) =>
    segmentsForDay(nov, c, d).filter((s) => s.hasLight).map((s) => [s.startMin / 60, Math.round(s.endMin / 60)]);
  assert.deepEqual(hours(1, 17), [[9, 15]]);
  assert.deepEqual(hours(1, 30), [[0, 3], [15, 18]]);
  assert.deepEqual(hours(2, 19), [[9, 15]]);
  assert.deepEqual(hours(2, 22), [[6, 12], [21, 24]]);
  assert.deepEqual(hours(19, 28), [[12, 15]]);
  assert.deepEqual(hours(19, 25), [[0, 3], [15, 18]]);
  // 20 y 21 son un solo bloque: mismas horas
  for (const d of [17, 18, 19, 20, 29, 30]) assert.deepEqual(hours(20, d), hours(21, d));
  assert.deepEqual(hours(20, 17), [[6, 9], [21, 24]]);
  assert.deepEqual(hours(20, 18), [[12, 15]]);
});

test('cada tramo del 17 al 30 tiene luz para algun circuito y el dia suma 24 h entre todos', () => {
  for (let d = 17; d <= 30; d++) {
    const total = [1, 2, 19, 20].reduce(
      (n, c) => n + segmentsForDay(nov, c, d).filter((s) => s.hasLight).reduce((m, s) => m + s.endMin - s.startMin, 0),
      0,
    );
    assert.equal(total, 24 * 60, `dia ${d}`);
  }
});
