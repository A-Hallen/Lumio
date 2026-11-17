import { isNewer } from './version.ts';

/** Lo que publica schedule/index.json en "app". `minVersion` hace obligatoria la actualizacion. */
export type AppInfo = { latest: string; apk: string; minVersion?: string; notes?: string };

export type AppUpdate = {
  version: string;
  apk: string;
  notes?: string;
  /** true: la version instalada es menor que `minVersion` y la app no se puede usar hasta actualizar. */
  required: boolean;
};

export function parseAppInfo(x: unknown): AppInfo | null {
  if (!x || typeof x !== 'object') return null;
  const a = x as Record<string, unknown>;
  if (typeof a.latest !== 'string' || typeof a.apk !== 'string') return null;
  return {
    latest: a.latest,
    apk: a.apk,
    ...(typeof a.minVersion === 'string' && a.minVersion ? { minVersion: a.minVersion } : {}),
    ...(typeof a.notes === 'string' && a.notes ? { notes: a.notes } : {}),
  };
}

/**
 * Que hay que decirle a esta instalacion: nada, "hay una version nueva" o "hay que actualizar ya".
 * La actualizacion solo es obligatoria si la version minima se puede conseguir (no es mayor que la ultima publicada);
 * un `minVersion` mal escrito no puede dejar a nadie atrapado sin salida.
 */
export function updateFor(info: AppInfo | null, current: string, fallbackApk = ''): AppUpdate | null {
  if (!info) return null;
  const newer = isNewer(info.latest, current);
  const required = !!info.minVersion && isNewer(info.minVersion, current) && !isNewer(info.minVersion, info.latest);
  if (!newer && !required) return null;
  return { version: info.latest, apk: info.apk || fallbackApk, notes: info.notes, required };
}
