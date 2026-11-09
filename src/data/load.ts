import AsyncStorage from '@react-native-async-storage/async-storage';
import { bundled } from './bundled';
import { loadStoredSchedules, mergeSchedules, type KV } from '../core/sync';
import { DEFAULT_CIRCUIT } from '../config';
import type { MonthSchedule } from '../core/schedule';

export const kv: KV = {
  get: (k) => AsyncStorage.getItem(k),
  set: (k, v) => AsyncStorage.setItem(k, v),
};

/** Horarios de fabrica mas los descargados; de cada mes gana el mas reciente. Lo usan la app y el widget. */
export async function loadSchedules(): Promise<MonthSchedule[]> {
  return mergeSchedules(bundled, await loadStoredSchedules(kv));
}

export const bundledUpdatedAt = Object.fromEntries(bundled.map((s) => [s.month, s.updatedAt ?? '']));

export async function loadCircuit(): Promise<number> {
  const raw = await kv.get('lumio.circuit');
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : DEFAULT_CIRCUIT;
}

export const saveCircuit = (c: number) => kv.set('lumio.circuit', String(c));
