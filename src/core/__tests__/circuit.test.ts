import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCircuit } from '../circuit.ts';

const valid = [1, 2, 19, 20, 21];

test('sin circuito guardado no hay circuito por defecto', () => {
  assert.equal(parseCircuit(null, valid), null);
  assert.equal(parseCircuit('', valid), null);
});

test('un circuito guardado y valido se respeta', () => {
  assert.equal(parseCircuit('19', valid), 19);
});

test('un circuito que ya no esta en los horarios obliga a elegir de nuevo', () => {
  assert.equal(parseCircuit('7', valid), null);
  assert.equal(parseCircuit('abc', valid), null);
  assert.equal(parseCircuit('1.5', valid), null);
});
