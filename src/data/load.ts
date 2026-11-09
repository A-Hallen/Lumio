import AsyncStorage from '@react-native-async-storage/async-storage';
import { bundled } from './bundled';
import { loadStoredSchedules, mergeSchedules, type KV } from '../core/sync';
import { parseCircuit } from '../core/circuit';
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

export const circuitsOf = (schedules: MonthSchedule[]) =>
  [...new Set(schedules.flatMap((s) => s.circuits))].sort((a, b) => a - b);

/** Circuito elegido por la persona; null hasta que lo elija (no hay circuito por defecto). */
export async function loadCircuit(schedules: MonthSchedule[]): Promise<number | null> {
  return parseCircuit(await kv.get('lumio.circuit'), circuitsOf(schedules));
}

export const saveCircuit = (c: number) => kv.set('lumio.circuit', String(c));
