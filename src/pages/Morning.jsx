import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlarmClock, ArrowRight, CalendarPlus, Check, ExternalLink, Music, RefreshCw, Volume2 } from 'lucide-react';
import LevelPicker from '../components/LevelPicker';
import Confetti from '../components/Confetti';
import { dateKey, uid, useLogs, usePrefs, useSessions } from '../lib/storage';
import {
  MORNING_TYPES,
  closingMessage,
  formatToday,
  generalTips,
  greeting,
  isWinter,
  motivationalMessage,
  routineSteps,
  suggestMorning,
  winterTips,
} from '../lib/messages';
import { exerciseApps, pickMusic } from '../lib/apps';
import { alarmIcs, speak } from '../lib/alarm';
import { useAlarm } from '../lib/useAlarm';

const STEPS = 4;

function Progressbar({ step }) {
  return (
    <div className="mb-8 flex gap-2">
      {Array.from({ length: STEPS }).map((_, i) => (
        <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-sun' : 'bg-line'}`} />
      ))}
    </div>
  );
}

function Header({ prefs, setPrefs }) {
  const g = greeting(prefs.name);
  const [name, setName] = useState('');
  return (
    <header className="mb-6 animate-rise">
      <div className="flex items-center gap-3">
        <span className="text-5xl">{g.icon}</span>
        <span className="label">{formatToday()}</span>
      </div>
      <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight">{g.title}</h1>
      <p className="mt-2 text-lg text-muted">Primero vos, después el mundo 🌎</p>
      {!prefs.name && (
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) setPrefs((p) => ({ ...p, name: name.trim() }));
          }}
        >
          <input className="input py-2.5 text-base" placeholder="¿Cómo te llamás?" value={name} onChange={(e) => setName(e.target.value)} />
          <button type="submit" className="rounded-2xl bg-ink px-4 text-white">
            <Check size={20} />
          </button>
        </form>
      )}
    </header>
  );
}

function AlarmCard({ prefs }) {
  const alarm = useAlarm();
  const downloadIcs = () => {
    const blob = new Blob([alarmIcs(prefs.wakeTime, motivationalMessage(prefs, 'lenta'))], { type: 'text/calendar' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'alba-despertador.ics';
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const at = alarm.at ? new Date(alarm.at) : null;
  return (
    <section className="card-white mt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlarmClock className={alarm.armed ? 'text-sun' : 'text-muted'} />
          <div>
            <p className="font-semibold">Despertador Alba</p>
            <p className="text-sm text-muted">
              {alarm.armed && at
                ? `Suena ${at.toLocaleDateString('es-AR', { weekday: 'long' })} a las ${at.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`
                : `Hora ideal: ${prefs.wakeTime} (cambiala en Ajustes)`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => (alarm.armed ? alarm.disarm() : alarm.arm(prefs.wakeTime))}
          className={`relative h-8 w-14 rounded-full transition ${alarm.armed ? 'bg-sun' : 'bg-line'}`}
          aria-label="Activar despertador"
        >
          <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${alarm.armed ? 'left-7' : 'left-1'}`} />
        </button>
      </div>
      {alarm.armed && (
        <p className="mt-3 text-sm text-muted">
          Dejá Alba abierta y el celu cargando: suena con un tono suave que va subiendo y te habla con un mensaje.
        </p>
      )}
      <button type="button" onClick={downloadIcs} className="mt-3 flex items-center gap-2 text-sm font-medium text-sun">
        <CalendarPlus size={16} /> Agregar alarma diaria al calendario (por si Alba está cerrada)
      </button>
    </section>
  );
}

function scheduleDate(when) {
  const d = new Date();
  if (when === 'manana') d.setDate(d.getDate() + 1);
  if (when === 'finde') {
    const day = d.getDay();
    if (day !== 6 && day !== 0) d.setDate(d.getDate() + (6 - day));
  }
  return dateKey(d);
}

export default function Morning() {
  const [prefs, setPrefs] = usePrefs();
  const [logs, setLogs] = useLogs();
  const [sessions, setSessions] = useSessions();
  const today = dateKey();
  const log = logs.find((l) => l.date === today);

  const [sleep, setSleep] = useState(log?.sleep ?? 3);
  const [energy, setEnergy] = useState(log?.energy ?? 3);
  const [step, setStep] = useState(() => {
    if (!log) return 0;
    if (log.moodAfter) return 4;
    return log.type ? 2 : 1;
  });
  const [msgSeed, setMsgSeed] = useState(0);
  const [moodAfter, setMoodAfter] = useState(3);
  const [justDone, setJustDone] = useState(false);

  const saveLog = (patch) =>
    setLogs((all) => {
      const existing = all.find((l) => l.date === today);
      if (existing) return all.map((l) => (l.date === today ? { ...l, ...patch } : l));
      return [...all, { id: uid(), date: today, steps: [], ...patch }];
    });

  const suggestion = useMemo(() => suggestMorning({ sleep, energy, prefs, logs }), [sleep, energy, prefs, logs]);
  const type = log?.type;
  const winter = isWinter(prefs.hemisphere);
  const steps = type ? routineSteps(type, { winter }) : [];
  const done = log?.steps || [];
  const message = type ? motivationalMessage(prefs, type, msgSeed) : '';
  const music = type ? pickMusic(prefs.musicGenres, type, new Date().getDate() + msgSeed) : null;
  const apps = exerciseApps(prefs);
  const todaySession = sessions.find((s) => s.createdOn === today);

  const toggleStep = (id) =>
    saveLog({ steps: done.includes(id) ? done.filter((s) => s !== id) : [...done, id] });

  const logExercise = (app, status, when) => {
    const session = {
      id: todaySession?.id || uid(),
      createdOn: today,
      app: app?.name || 'Libre',
      status,
      date: status === 'done' ? today : scheduleDate(when),
      when: when || null,
    };
    setSessions((all) => [...all.filter((s) => s.id !== session.id), session]);
    if (status === 'done' && !done.includes('entreno')) saveLog({ steps: [...done, 'entreno'], exerciseDone: true });
  };

  const restart = () => {
    setLogs((all) => all.filter((l) => l.date !== today));
    setJustDone(false);
    setStep(0);
  };

  // Mañana ya completada
  if (step === 4 && log?.moodAfter) {
    const close = closingMessage(log.energy, log.moodAfter);
    const pending = sessions.filter((s) => s.status === 'pending');
    return (
      <div>
        {justDone && <Confetti />}
        <Header prefs={prefs} setPrefs={setPrefs} />
        <section className="card animate-rise text-center">
          <div className="text-6xl">{close.emoji}</div>
          <h2 className="mt-3 text-2xl font-bold">¡Mañana completada!</h2>
          <p className="mt-2 text-muted">{close.text}</p>
          <p className="mt-4 text-sm text-muted">
            {MORNING_TYPES[log.type].emoji} {MORNING_TYPES[log.type].title} · {log.steps.length} {log.steps.length === 1 ? "paso hecho" : "pasos hechos"}
          </p>
        </section>
        {pending.length > 0 && (
          <Link to="/rutina" className="card-white mt-4 flex items-center justify-between">
            <span>
              🗓️ Tenés {pending.length} entreno{pending.length > 1 ? 's' : ''} pendiente{pending.length > 1 ? 's' : ''}
            </span>
            <ArrowRight size={18} />
          </Link>
        )}
        <AlarmCard prefs={prefs} />
        <button type="button" onClick={restart} className="mx-auto mt-6 flex items-center gap-2 text-sm text-muted">
          <RefreshCw size={14} /> Rehacer el chequeo de hoy
        </button>
      </div>
    );
  }

  return (
    <div>
      <Header prefs={prefs} setPrefs={setPrefs} />
      <Progressbar step={Math.min(step, 3)} />

      {step === 0 && (
        <div className="animate-rise">
          <section className="card space-y-6">
            <p className="label">Chequeo rápido 👇</p>
            <div>
              <p className="mb-3 text-lg text-ink/80">¿Cómo dormiste?</p>
              <LevelPicker value={sleep} onChange={setSleep} />
            </div>
            <div>
              <p className="mb-3 text-lg text-ink/80">¿Cómo está tu energía?</p>
              <LevelPicker value={energy} onChange={setEnergy} />
            </div>
          </section>
          <button
            type="button"
            className="btn-primary mt-6"
            onClick={() => {
              saveLog({ sleep, energy });
              setStep(1);
            }}
          >
            Dale, vamos <ArrowRight />
          </button>
          <AlarmCard prefs={prefs} />
        </div>
      )}

      {step === 1 && (
        <div className="animate-rise space-y-4">
          <p className="label">¿Qué mañana te pinta hoy?</p>
          <div className="rounded-2xl bg-sun-soft px-4 py-3 text-sm text-ink/80">💡 {suggestion.reason}</div>
          {Object.entries(MORNING_TYPES).map(([key, t]) => {
            const suggested = key === suggestion.type;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  saveLog({ type: key, steps: [] });
                  setStep(2);
                }}
                className={`flex w-full items-center gap-4 rounded-3xl p-5 text-left transition active:scale-[.98] ${
                  suggested ? `${t.color} shadow-md` : 'bg-sand/70'
                }`}
              >
                <span className="text-4xl">{t.emoji}</span>
                <span className="flex-1">
                  <span className="block text-xl font-semibold">{t.title}</span>
                  <span className={`block text-sm ${suggested ? 'text-white/85' : 'text-muted'}`}>{t.desc}</span>
                </span>
                {suggested && <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-semibold">Sugerida</span>}
              </button>
            );
          })}
          <button type="button" onClick={() => setStep(0)} className="mx-auto block pt-2 text-sm text-muted">
            ← Volver al chequeo
          </button>
        </div>
      )}

      {step === 2 && type && (
        <div className="animate-rise space-y-5">
          <section className={`rounded-3xl p-5 ${MORNING_TYPES[type].color}`}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-xl font-medium leading-snug">{message}</p>
              <div className="flex shrink-0 flex-col gap-2">
                <button type="button" onClick={() => speak(message)} className="rounded-full bg-white/20 p-2" aria-label="Escuchar">
                  <Volume2 size={18} />
                </button>
                <button type="button" onClick={() => setMsgSeed((s) => s + 1)} className="rounded-full bg-white/20 p-2" aria-label="Otro mensaje">
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="mb-3 flex items-center justify-between">
              <p className="label">Tu plan {MORNING_TYPES[type].emoji}</p>
              <span className="text-sm font-semibold text-sun">
                {done.length}/{steps.length}
              </span>
            </div>
            <ul className="space-y-2">
              {steps.map((s) => {
                const checked = done.includes(s.id);
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => toggleStep(s.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${checked ? 'bg-white/60' : 'bg-white'}`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
                          checked ? 'animate-pop border-sun bg-sun text-white' : 'border-line'
                        }`}
                      >
                        {checked && <Check size={16} strokeWidth={3} />}
                      </span>
                      <span className="text-xl">{s.emoji}</span>
                      <span className={checked ? 'text-muted line-through' : ''}>{s.text}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {music && (
            <section className="card-white">
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-sea-soft p-3 text-sea">
                  <Music size={22} />
                </span>
                <div>
                  <p className="text-sm text-muted">Banda sonora de hoy</p>
                  <p className="text-lg font-semibold">{music.genre}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <a href={music.spotify} target="_blank" rel="noreferrer" className="btn-ghost text-sm">
                  Spotify <ExternalLink size={14} />
                </a>
                <a href={music.youtube} target="_blank" rel="noreferrer" className="btn-ghost text-sm">
                  YouTube Music <ExternalLink size={14} />
                </a>
              </div>
            </section>
          )}

          <section className="space-y-3">
            <p className="label">{type === 'activa' ? '¿Con qué entrenás hoy? 💪' : '¿Y el entreno?'}</p>
            {todaySession && (
              <div className="rounded-2xl bg-sea-soft px-4 py-3 text-sm">
                {todaySession.status === 'done'
                  ? `✅ Entreno hecho con ${todaySession.app}. ¡Bestia!`
                  : `🗓️ Entreno agendado para ${todaySession.when === 'tarde' ? 'esta tarde' : todaySession.when === 'manana' ? 'mañana' : 'el finde'}. Cuando lo hagas, marcá la app abajo o en Rutina.`}
              </div>
            )}
            {type !== 'activa' && !todaySession && (
              <div className="card-white">
                <p className="text-ink/80">
                  {type === 'lenta'
                    ? 'Hoy no hace falta entrenar a la mañana. ¿Lo movemos para después?'
                    : 'Es día de descanso. Si te pinta moverte más tarde, lo agendamos.'}
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    ['tarde', 'Esta tarde'],
                    ['manana', 'Mañana'],
                    ['finde', 'El finde'],
                  ].map(([when, label]) => (
                    <button key={when} type="button" className="chip bg-sand" onClick={() => logExercise(null, 'pending', when)}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {(type === 'activa' || todaySession?.status === 'pending') &&
              apps.map((app) => (
                <div key={app.id} className="card-white">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{app.emoji}</span>
                    <div className="flex-1">
                      <p className="text-lg font-semibold">{app.name}</p>
                      <p className="text-xs font-medium uppercase tracking-wide text-sun">{app.kind}</p>
                      <p className="mt-1 text-sm text-muted">{app.blurb}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {app.links.map((l) => (
                      <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="btn-ghost py-2 text-sm">
                        {l.label} <ExternalLink size={14} />
                      </a>
                    ))}
                    <button type="button" className="btn-ghost border-sun py-2 text-sm text-sun" onClick={() => logExercise(app, 'done')}>
                      <Check size={16} /> Lo hice
                    </button>
                  </div>
                </div>
              ))}
          </section>

          {(winter || sleep <= 2) && (
            <section className="card">
              <p className="label mb-2">{winter ? '❄️ Tips para mañanas de frío' : '😴 Tips para despertar mejor'}</p>
              <ul className="space-y-1.5 text-sm text-ink/80">
                {(winter ? winterTips() : generalTips()).slice(0, 3).map((t) => (
                  <li key={t}>• {t}</li>
                ))}
              </ul>
            </section>
          )}

          <button type="button" className="btn-primary" onClick={() => setStep(3)}>
            Terminé mi mañana <ArrowRight />
          </button>
          <button type="button" onClick={() => setStep(1)} className="mx-auto block text-sm text-muted">
            ← Cambiar tipo de mañana
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="animate-rise">
          <section className="card space-y-4">
            <p className="label">Último chequeo 🙌</p>
            <p className="text-lg text-ink/80">¿Cómo te sentís ahora?</p>
            <LevelPicker value={moodAfter} onChange={setMoodAfter} />
          </section>
          <button
            type="button"
            className="btn-primary mt-6"
            onClick={() => {
              saveLog({ moodAfter });
              setJustDone(true);
              setStep(4);
            }}
          >
            Listo, ¡al mundo! 🌎
          </button>
        </div>
      )}
    </div>
  );
}
