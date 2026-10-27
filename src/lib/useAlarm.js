import { useCallback, useEffect, useState } from 'react';
import { keepScreenOn, nextAlarm, unlockAudio } from './alarm';

const KEY = 'alba.alarm';

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || { armed: false, at: null };
  } catch {
    return { armed: false, at: null };
  }
}

function write(v) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
  } catch {
    /* ignorar */
  }
  window.dispatchEvent(new CustomEvent('alba:alarm'));
}

export function useAlarm() {
  const [state, setState] = useState(read);
  useEffect(() => {
    const sync = () => setState(read());
    window.addEventListener('alba:alarm', sync);
    return () => window.removeEventListener('alba:alarm', sync);
  }, []);

  const arm = useCallback((wakeTime) => {
    unlockAudio();
    keepScreenOn(true);
    write({ armed: true, at: nextAlarm(wakeTime).getTime() });
  }, []);

  const disarm = useCallback(() => {
    keepScreenOn(false);
    write({ armed: false, at: null });
  }, []);

  // Después de sonar, queda programada para el día siguiente (o para posponer).
  const reschedule = useCallback((at) => write({ armed: true, at }), []);

  return { ...state, arm, disarm, reschedule };
}
