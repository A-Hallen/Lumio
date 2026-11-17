import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseAppInfo, updateFor } from '../appUpdate.ts';

const info = (o: object) => parseAppInfo({ latest: '0.2.0', apk: 'https://x/lumio.apk', ...o });

test('sin version nueva no hay aviso', () => {
  assert.equal(updateFor(info({}), '0.2.0'), null);
  assert.equal(updateFor(info({}), '0.3.0'), null);
  assert.equal(updateFor(null, '0.1.0'), null);
});

test('version nueva sin minimo: aviso opcional', () => {
  const u = updateFor(info({}), '0.1.0');
  assert.equal(u?.version, '0.2.0');
  assert.equal(u?.required, false);
});

test('por debajo de la version minima: obligatoria', () => {
  assert.equal(updateFor(info({ minVersion: '0.1.5' }), '0.1.4')?.required, true);
  assert.equal(updateFor(info({ minVersion: '0.1.5' }), '0.1.5')?.required, false);
  assert.equal(updateFor(info({ minVersion: '0.1.5' }), '0.1.9')?.required, false);
});

test('un minimo mayor que la ultima version publicada se ignora para no dejar a nadie atrapado', () => {
  const u = updateFor(info({ minVersion: '9.0.0' }), '0.1.0');
  assert.equal(u?.required, false);
  assert.equal(u?.version, '0.2.0');
});

test('un minimo basura no bloquea', () => {
  assert.equal(updateFor(info({ minVersion: 'pronto' }), '0.1.0')?.required, false);
});

test('sin enlace en el indice se usa el de respaldo', () => {
  const u = updateFor(parseAppInfo({ latest: '0.2.0', apk: '' }), '0.1.0', 'https://respaldo/lumio.apk');
  assert.equal(u?.apk, 'https://respaldo/lumio.apk');
});

test('parseAppInfo descarta lo que no es un objeto valido', () => {
  assert.equal(parseAppInfo(null), null);
  assert.equal(parseAppInfo({ latest: 2 }), null);
  assert.deepEqual(parseAppInfo({ latest: '1.0.0', apk: 'a', notes: 'n', minVersion: '0.9.0' }), { latest: '1.0.0', apk: 'a', minVersion: '0.9.0', notes: 'n' });
});
