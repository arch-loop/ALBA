import { useCallback, useEffect, useState } from 'react';

// Todo se guarda en el dispositivo (localStorage). Sin servidor, sin créditos.
const KEYS = { prefs: 'alba.prefs', logs: 'alba.logs', sessions: 'alba.sessions' };

export const DEFAULT_PREFS = {
  name: '',
  wakeTime: '06:00',
  morningPref: 'lenta', // lenta | moderada | alta
  motivationStyle: 'humor', // suave | energetico | filosofico | humor
  musicGenres: ['Lo-fi', 'Rock', 'Jazz', 'Electrónica'],
  exerciseTypes: ['Bicicleta', 'Pesas', 'Stretching'],
  restDays: [1, 5], // índices de Date.getDay(): 0 = domingo
  hemisphere: 'sur',
  coreformUrl: '',
  voice: true,
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* almacenamiento lleno o bloqueado: la app sigue funcionando en memoria */
  }
  window.dispatchEvent(new CustomEvent('alba:store', { detail: key }));
}

function useStored(key, fallback) {
  const [value, setValue] = useState(() => read(key, fallback));
  useEffect(() => {
    const sync = (e) => {
      if (!e.detail || e.detail === key || e.key === key) setValue(read(key, fallback));
    };
    window.addEventListener('alba:store', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('alba:store', sync);
      window.removeEventListener('storage', sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const save = useCallback(
    (next) => {
      const resolved = typeof next === 'function' ? next(read(key, fallback)) : next;
      write(key, resolved);
      setValue(resolved);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  return [value, save];
}

export function usePrefs() {
  const [prefs, setPrefs] = useStored(KEYS.prefs, DEFAULT_PREFS);
  return [{ ...DEFAULT_PREFS, ...prefs }, setPrefs];
}

export const useLogs = () => useStored(KEYS.logs, []);
export const useSessions = () => useStored(KEYS.sessions, []);

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export function dateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function exportData() {
  return JSON.stringify(
    { prefs: read(KEYS.prefs, DEFAULT_PREFS), logs: read(KEYS.logs, []), sessions: read(KEYS.sessions, []) },
    null,
    2,
  );
}

export function importData(json) {
  const data = JSON.parse(json);
  if (data.prefs) write(KEYS.prefs, data.prefs);
  if (Array.isArray(data.logs)) write(KEYS.logs, data.logs);
  if (Array.isArray(data.sessions)) write(KEYS.sessions, data.sessions);
}
