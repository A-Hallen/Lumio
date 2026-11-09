import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compactRange, dialLabels, formatHour, hourParts, parseTimeFormat } from '../time.ts';

test('por defecto 12 horas; solo "24" cambia a 24 horas', () => {
  assert.equal(parseTimeFormat(null), '12');
  assert.equal(parseTimeFormat('basura'), '12');
  assert.equal(parseTimeFormat('24'), '24');
  assert.equal(parseTimeFormat('12'), '12');
});

test('12 horas con am y pm', () => {
  assert.equal(formatHour(0, '12'), '12:00 am');
  assert.equal(formatHour(180, '12'), '3:00 am');
  assert.equal(formatHour(720, '12'), '12:00 pm');
  assert.equal(formatHour(18 * 60, '12'), '6:00 pm');
  assert.equal(formatHour(21 * 60 + 26, '12'), '9:26 pm');
  assert.equal(formatHour(1440, '12'), '12:00 am');
});

test('24 horas como siempre', () => {
  assert.equal(formatHour(0), '00:00');
  assert.equal(formatHour(21 * 60 + 5, '24'), '21:05');
  assert.equal(formatHour(1440, '24'), '00:00');
});

test('hourParts separa cifras y sufijo', () => {
  assert.deepEqual(hourParts(21 * 60 + 26, '12'), { main: '9:26', suffix: 'pm' });
  assert.deepEqual(hourParts(21 * 60 + 26, '24'), { main: '21:26', suffix: '' });
});

test('rangos cortos para el widget', () => {
  assert.equal(compactRange(180, 360, '12'), '3–6 am');
  assert.equal(compactRange(18 * 60, 21 * 60, '12'), '6–9 pm');
  assert.equal(compactRange(9 * 60, 13 * 60, '12'), '9 am–1 pm');
  assert.equal(compactRange(21 * 60, 1440, '12'), '9 pm–12 am');
  assert.equal(compactRange(0, 180, '12'), '12–3 am');
  assert.equal(compactRange(9 * 60 + 30, 11 * 60, '12'), '9:30–11 am');
  assert.equal(compactRange(180, 360, '24'), '03:00–06:00');
});

test('marcas del abanico', () => {
  assert.deepEqual(dialLabels('24'), ['00', '06', '12', '18', '24']);
  assert.deepEqual(dialLabels('12'), ['12 am', '6 am', '12 pm', '6 pm', '12 am']);
});
