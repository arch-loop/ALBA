import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlarm } from '../lib/useAlarm';
import { nextAlarm, startRinging, stopRinging } from '../lib/alarm';
import { usePrefs } from '../lib/storage';
import { greeting, motivationalMessage, affirmations } from '../lib/messages';

export default function AlarmOverlay() {
  const [prefs] = usePrefs();
  const alarm = useAlarm();
  const navigate = useNavigate();
  const [ringing, setRinging] = useState(false);
  const [snoozed, setSnoozed] = useState(false);
  const [affIndex, setAffIndex] = useState(0);

  useEffect(() => {
    if (!alarm.armed || !alarm.at || ringing) return undefined;
    const check = () => {
      if (Date.now() >= alarm.at) {
        const g = greeting(prefs.name);
        startRinging(`${g.title} ${motivationalMessage(prefs, 'lenta', 7)}`, prefs.voice);
        setRinging(true);
      }
    };
    check();
    const t = setInterval(check, 10000);
    return () => clearInterval(t);
  }, [alarm.armed, alarm.at, ringing, prefs]);

  useEffect(() => {
    if (!ringing) return undefined;
    const t = setInterval(() => setAffIndex((i) => (i + 1) % affirmations().length), 2500);
    return () => clearInterval(t);
  }, [ringing]);

  if (!ringing) return null;

  const g = greeting(prefs.name);

  const wakeUp = () => {
    stopRinging();
    setRinging(false);
    setSnoozed(false);
    alarm.reschedule(nextAlarm(prefs.wakeTime, new Date(Date.now() + 60000)).getTime());
    navigate('/');
  };

  const snooze = () => {
    stopRinging();
    setRinging(false);
    setSnoozed(true);
    alarm.reschedule(Date.now() + 5 * 60000);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#FBD9B8] via-[#FBE7D7] to-cream px-8 text-center">
      <div className="mb-6 flex h-32 w-32 animate-pulseRing items-center justify-center rounded-full bg-sun text-6xl">
        {g.icon}
      </div>
      <h2 className="text-4xl font-bold">{g.title}</h2>
      <p key={affIndex} className="mt-4 animate-rise text-xl text-muted">
        {affirmations()[affIndex]}
      </p>
      <div className="mt-12 w-full space-y-3">
        <button type="button" className="btn-primary" onClick={wakeUp}>
          Ya estoy despierto ☀️
        </button>
        {!snoozed && (
          <button type="button" className="btn-ghost w-full" onClick={snooze}>
            5 minutitos más 😴 (solo una vez)
          </button>
        )}
      </div>
    </div>
  );
}
