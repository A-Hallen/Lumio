import type { MonthSchedule } from './schedule.ts';
import { validateSchedule } from './validate.ts';
import { isNewer } from './version.ts';

export interface KV {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}

export type AppUpdate = { version: string; apk: string; notes?: string };

export type SyncOptions = {
  kv: KV;
  fetchImpl: typeof fetch;
  /** Direcciones base en orden de preferencia; se usa la primera que responda. */
  mirrors: string[];
  now: number;
  force: boolean;
  /** updatedAt de los meses que ya vienen dentro de la app. */
  bundledUpdatedAt: Record<string, string>;
  appVersion: string;
  minIntervalMs?: number;
  timeoutMs?: number;
};

export type SyncResult = {
  skipped: boolean;
  reachedMirror: string | null;
  downloaded: string[];
  appUpdate: AppUpdate | null;
};

const SIX_HOURS = 6 * 60 * 60 * 1000;
const keyOf = (month: string) => `lumio.schedule.${month}`;

export function mergeSchedules(a: MonthSchedule[], b: MonthSchedule[]): MonthSchedule[] {
  const best = new Map<string, MonthSchedule>();
  for (const s of [...a, ...b]) {
    const cur = best.get(s.month);
    if (!cur || (s.updatedAt ?? '') > (cur.updatedAt ?? '')) best.set(s.month, s);
  }
  return [...best.values()].sort((x, y) => x.month.localeCompare(y.month));
}

export async function loadStoredSchedules(kv: KV): Promise<MonthSchedule[]> {
  const months: string[] = JSON.parse((await kv.get('lumio.months')) ?? '[]');
  const out: MonthSchedule[] = [];
  for (const m of months) {
    try {
      out.push(validateSchedule(JSON.parse((await kv.get(keyOf(m))) ?? 'null')));
    } catch {
      /* un mes guardado que ya no valida se ignora; queda el de fabrica */
    }
  }
  return out;
}

async function getJson(fetchImpl: typeof fetch, url: string, timeoutMs: number): Promise<unknown> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, { signal: ctl.signal, headers: { 'cache-control': 'no-cache' } });
    if (!res.ok) throw new Error(`${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function syncAll(o: SyncOptions): Promise<SyncResult> {
  const result: SyncResult = { skipped: false, reachedMirror: null, downloaded: [], appUpdate: null };
  const last = Number((await o.kv.get('lumio.lastCheck')) ?? 0);
  if (!o.force && last && o.now - last < (o.minIntervalMs ?? SIX_HOURS)) return { ...result, skipped: true };

  const timeoutMs = o.timeoutMs ?? 8000;
  let index: any = null;
  for (const mirror of o.mirrors) {
    try {
      index = await getJson(o.fetchImpl, `${mirror}/index.json`, timeoutMs);
      result.reachedMirror = mirror;
      break;
    } catch {
      /* siguiente espejo */
    }
  }
  if (!index || !result.reachedMirror) return result;
  await o.kv.set('lumio.lastCheck', String(o.now));

  const stored = await loadStoredSchedules(o.kv);
  const known = new Map(stored.map((s) => [s.month, s.updatedAt ?? '']));
  for (const [m, u] of Object.entries(o.bundledUpdatedAt)) if (u > (known.get(m) ?? '')) known.set(m, u);

  const months: string[] = stored.map((s) => s.month);
  for (const entry of Array.isArray(index.months) ? index.months : []) {
    const have = known.get(entry?.month);
    const isNew = have === undefined || (typeof entry.updatedAt === 'string' && entry.updatedAt > have);
    if (!isNew || typeof entry.file !== 'string' || !/^[\w.-]+\.json$/.test(entry.file)) continue;
    try {
      const schedule = validateSchedule(await getJson(o.fetchImpl, `${result.reachedMirror}/${entry.file}`, timeoutMs));
      await o.kv.set(keyOf(schedule.month), JSON.stringify(schedule));
      if (!months.includes(schedule.month)) months.push(schedule.month);
      result.downloaded.push(schedule.month);
    } catch {
      /* mes roto o corte a mitad: se conserva lo anterior */
    }
  }
  await o.kv.set('lumio.months', JSON.stringify(months));

  const app = index.app;
  if (app && typeof app.latest === 'string' && typeof app.apk === 'string' && isNewer(app.latest, o.appVersion))
    result.appUpdate = { version: app.latest, apk: app.apk, notes: typeof app.notes === 'string' ? app.notes : undefined };
  return result;
}
