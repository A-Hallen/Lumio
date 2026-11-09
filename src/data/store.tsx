import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import * as Application from 'expo-application';
import { getStatus, type MonthSchedule, type Status } from '../core/schedule';
import { syncAll, type AppUpdate } from '../core/sync';
import { MIRRORS } from '../config';
import { bundledUpdatedAt, kv, loadCircuit, loadSchedules, saveCircuit } from './load';
import { bundled } from './bundled';

type Sync = 'idle' | 'syncing' | 'offline' | 'ok';

type Ctx = {
  ready: boolean;
  now: Date;
  schedules: MonthSchedule[];
  circuit: number;
  circuits: number[];
  setCircuit: (c: number) => void;
  status: Status;
  sync: Sync;
  appUpdate: AppUpdate | null;
  refresh: () => Promise<void>;
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [schedules, setSchedules] = useState<MonthSchedule[]>(bundled);
  const [circuit, setCircuitState] = useState(1);
  const [sync, setSync] = useState<Sync>('idle');
  const [appUpdate, setAppUpdate] = useState<AppUpdate | null>(null);
  const busy = useRef(false);

  const refresh = useCallback(async (force = true) => {
    if (busy.current) return;
    busy.current = true;
    setSync('syncing');
    try {
      const r = await syncAll({
        kv,
        fetchImpl: fetch,
        mirrors: MIRRORS,
        now: Date.now(),
        force,
        bundledUpdatedAt,
        appVersion: Application.nativeApplicationVersion ?? '0.0.0',
      });
      if (r.downloaded.length) setSchedules(await loadSchedules());
      if (r.appUpdate) setAppUpdate(r.appUpdate);
      setSync(r.skipped || r.reachedMirror ? 'ok' : 'offline');
    } catch {
      setSync('offline');
    } finally {
      busy.current = false;
    }
  }, []);

  useEffect(() => {
    (async () => {
      const [all, c] = await Promise.all([loadSchedules(), loadCircuit()]);
      setSchedules(all);
      setCircuitState(c);
      setReady(true);
      refresh(false);
    })();
  }, [refresh]);

  // Reloj: avanza cada 20 s, suficiente para una cuenta atras en minutos.
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 20_000);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') {
        setNow(new Date());
        refresh(false);
      }
    });
    return () => {
      clearInterval(t);
      sub.remove();
    };
  }, [refresh]);

  const setCircuit = useCallback((c: number) => {
    setCircuitState(c);
    saveCircuit(c);
  }, []);

  const circuits = useMemo(() => [...new Set(schedules.flatMap((s) => s.circuits))].sort((a, b) => a - b), [schedules]);
  const status = useMemo(() => getStatus(schedules, circuit, now), [schedules, circuit, now]);

  const value: Ctx = { ready, now, schedules, circuit, circuits, setCircuit, status, sync, appUpdate, refresh: () => refresh(true) };
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error('useStore fuera de StoreProvider');
  return c;
}
