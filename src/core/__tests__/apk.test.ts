import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apkForArchitectures } from '../apk.ts';

const URL = 'https://github.com/A-Hallen/Lumio/releases/latest/download/lumio.apk';

test('telefono de 64 bits baja el APK normal', () => {
  assert.equal(apkForArchitectures(URL, ['arm64-v8a', 'armeabi-v7a', 'armeabi']), URL);
});

test('telefono que solo corre 32 bits baja el de 32 bits', () => {
  assert.equal(apkForArchitectures(URL, ['armeabi-v7a', 'armeabi']), URL.replace('lumio.apk', 'lumio-32bit.apk'));
});

test('sin datos de arquitectura no cambia el enlace', () => {
  assert.equal(apkForArchitectures(URL, null), URL);
  assert.equal(apkForArchitectures(URL, []), URL);
  assert.equal(apkForArchitectures(URL, ['x86_64']), URL);
});
