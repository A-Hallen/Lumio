import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateSchedule } from '../validate.ts';
import { isNewer } from '../version.ts';
import { syncAll, mergeSchedules, type KV } from '../sync.ts';
import type { MonthSchedule } from '../schedule.ts';

const nov = JSON.parse(readFileSync(new URL('../../../schedule/2026-11.json', import.meta.url), 'utf8')) as MonthSchedule;

const memory = (): KV & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return { data, get: async (k) => data.get(k) ?? null, set: async (k, v) => void data.set(k, v) };
};
const reply = (body: unknown) => ({ ok: true, status: 200, json: async () => body }) as Response;
const down = () => Promise.reject(new Error('sin red'));

test('validateSchedule acepta el mes real', () => {
  assert.equal(validateSchedule(nov).month, '2026-11');
});

test('validateSchedule rechaza datos rotos', () => {
  assert.throws(() => validateSchedule({ ...nov, slots: [] }));
  assert.throws(() => validateSchedule({ ...nov, month: 'noviembre' }));
  assert.throws(() => validateSchedule({ ...nov, days: { ...nov.days, '3': [1, 2] } }));
  assert.throws(() => validateSchedule({ ...nov, days: { ...nov.days, '3': [99, 1, 1, 1, 1, 1, 1, 1] } }));
  assert.throws(() => validateSchedule(null));
});

test('isNewer compara versiones', () => {
  assert.equal(isNewer('0.2.0', '0.1.9'), true);
  assert.equal(isNewer('v1.0.0', '0.9.9'), true);
  assert.equal(isNewer('0.1.0', '0.1.0'), false);
  assert.equal(isNewer('0.1.0', '0.1.1'), false);
  assert.equal(isNewer('basura', '0.1.0'), false);
});

test('mergeSchedules se queda con el mas reciente de cada mes', () => {
  const older = { ...nov, updatedAt: '2026-11-01T00:00:00Z' };
  const newer = { ...nov, updatedAt: '2026-11-20T00:00:00Z' };
  assert.equal(mergeSchedules([older], [newer])[0].updatedAt, newer.updatedAt);
  assert.equal(mergeSchedules([newer], [older])[0].updatedAt, newer.updatedAt);
});

test('syncAll descarga el mes nuevo y avisa de la app nueva', async () => {
  const kv = memory();
  const dec = { ...nov, month: '2026-12', updatedAt: '2026-12-01T00:00:00Z', days: { ...nov.days, '31': nov.days['1'] } };
  const fetchImpl = async (url: string) => {
    if (url.endsWith('/index.json'))
      return reply({ months: [{ month: '2026-12', file: '2026-12.json', updatedAt: dec.updatedAt }], app: { latest: '0.2.0', apk: 'https://x/lumio.apk' } });
    if (url.endsWith('/2026-12.json')) return reply(dec);
    throw new Error('404');
  };
  const r = await syncAll({ kv, fetchImpl: fetchImpl as never, mirrors: ['https://m1'], now: Date.now(), force: true, bundledUpdatedAt: {}, appVersion: '0.1.0' });
  assert.deepEqual(r.downloaded, ['2026-12']);
  assert.equal(r.appUpdate?.version, '0.2.0');
  assert.ok(kv.data.has('lumio.schedule.2026-12'));
});

test('syncAll prueba el siguiente espejo si el primero no responde', async () => {
  const kv = memory();
  const calls: string[] = [];
  const fetchImpl = async (url: string) => {
    calls.push(url);
    if (url.startsWith('https://caido')) return down();
    return reply({ months: [], app: { latest: '0.1.0', apk: 'x' } });
  };
  const r = await syncAll({ kv, fetchImpl: fetchImpl as never, mirrors: ['https://caido', 'https://bueno'], now: 0, force: true, bundledUpdatedAt: {}, appVersion: '0.1.0' });
  assert.equal(r.reachedMirror, 'https://bueno');
  assert.equal(r.appUpdate, null);
});

test('syncAll sin red no rompe nada y no gasta datos si revisó hace poco', async () => {
  const kv = memory();
  const bad = await syncAll({ kv, fetchImpl: down as never, mirrors: ['https://a'], now: 1000, force: true, bundledUpdatedAt: {}, appVersion: '0.1.0' });
  assert.equal(bad.reachedMirror, null);
  await kv.set('lumio.lastCheck', String(1000));
  let hits = 0;
  const counting = async () => (hits++, reply({ months: [] }));
  const skip = await syncAll({ kv, fetchImpl: counting as never, mirrors: ['https://a'], now: 1000 + 60_000, force: false, bundledUpdatedAt: {}, appVersion: '0.1.0' });
  assert.equal(skip.skipped, true);
  assert.equal(hits, 0);
});

test('syncAll descarta un mes mal formado y no lo guarda', async () => {
  const kv = memory();
  const fetchImpl = async (url: string) =>
    url.endsWith('/index.json')
      ? reply({ months: [{ month: '2026-12', file: '2026-12.json', updatedAt: 'x' }] })
      : reply({ month: '2026-12', slots: [] });
  const r = await syncAll({ kv, fetchImpl: fetchImpl as never, mirrors: ['https://m'], now: 0, force: true, bundledUpdatedAt: {}, appVersion: '0.1.0' });
  assert.deepEqual(r.downloaded, []);
  assert.equal(kv.data.has('lumio.schedule.2026-12'), false);
});
