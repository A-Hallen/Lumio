import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fanWedges, needlePoint } from '../fan.ts';

const geo = { cx: 100, cy: 100, rOuter: 80, rInner: 30 };

test('8 cristales, el primero arranca a la izquierda (00:00)', () => {
  const w = fanWedges(geo, [false, true, false, false, false, false, true, false], 1);
  assert.equal(w.length, 8);
  assert.match(w[0].d, /^M 20\.00 100\.00/); // cx - rOuter, cy
  assert.deepEqual(w.map((x) => x.hasLight), [false, true, false, false, false, false, true, false]);
  assert.deepEqual(w.map((x) => x.isCurrent), [false, true, false, false, false, false, false, false]);
});

test('la aguja va de izquierda (00:00) a derecha (24:00) pasando por arriba a las 12:00', () => {
  const start = needlePoint(geo, 0);
  const noon = needlePoint(geo, 720);
  const end = needlePoint(geo, 1440);
  assert.ok(Math.abs(start.x - 20) < 1e-6 && Math.abs(start.y - 100) < 1e-6);
  assert.ok(Math.abs(noon.x - 100) < 1e-6 && Math.abs(noon.y - 20) < 1e-6);
  assert.ok(Math.abs(end.x - 180) < 1e-6 && Math.abs(end.y - 100) < 1e-6);
});
