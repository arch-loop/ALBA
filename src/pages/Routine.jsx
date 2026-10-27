import { useState } from 'react';
import { Calendar, Check, Dumbbell, Plus, Trash2 } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import { dateKey, parseKey, uid, usePrefs, useSessions } from '../lib/storage';
import { exerciseApps } from '../lib/apps';

const DAY_LETTERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

// Lunes a domingo de la semana actual.
function currentWeek(now = new Date()) {
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return dateKey(d);
  });
}

function prettyDate(key) {
  const today = dateKey();
  const d = parseKey(key);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (key === today) return 'Hoy';
  if (key === dateKey(tomorrow)) return 'Mañana';
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short' });
}

export default function Routine() {
  const [prefs] = usePrefs();
  const [sessions, setSessions] = useSessions();
  const [adding, setAdding] = useState(false);
  const apps = exerciseApps(prefs);
  const today = dateKey();
  const week = currentWeek();

  const done = sessions.filter((s) => s.status === 'done').sort((a, b) => b.date.localeCompare(a.date));
  const pending = sessions.filter((s) => s.status === 'pending').sort((a, b) => a.date.localeCompare(b.date));
  const weekDone = done.filter((s) => week.includes(s.date));

  const update = (id, patch) => setSessions((all) => all.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const remove = (id) => setSessions((all) => all.filter((s) => s.id !== id));
  const add = (app) => {
    setSessions((all) => [...all, { id: uid(), createdOn: today, app, status: 'done', date: today }]);
    setAdding(false);
  };

  const streakMsg =
    weekDone.length === 0
      ? 'La semana recién arranca. ¡El primero es el que más cuesta!'
      : weekDone.length < 3
        ? '¡Buen ritmo! Cada sesión suma.'
        : '¡Semana de bestia! 🔥';

  return (
    <div>
      <PageTitle title="Mi Rutina" emoji="💪" subtitle="Seguimiento de tu actividad física" />

      <section className="animate-rise rounded-3xl border border-sun/20 bg-gradient-to-br from-sun-soft to-cream p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-lg text-ink/80">Esta semana</p>
            <p className="text-5xl font-bold text-sun">{weekDone.length}</p>
            <p className="text-muted">sesiones</p>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {week.map((key, i) => {
              const isDone = weekDone.some((s) => s.date === key);
              const isPending = pending.some((s) => s.date === key);
              const isToday = key === today;
              return (
                <div key={key} className="flex flex-col items-center gap-1.5">
                  <span className={`text-xs ${isToday ? 'font-bold text-sun' : 'text-muted'}`}>{DAY_LETTERS[i]}</span>
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs ${
                      isDone ? 'bg-sun text-white' : isPending ? 'border-2 border-dashed border-sun/60' : 'bg-line/70'
                    } ${isToday && !isDone ? 'ring-2 ring-sun/40' : ''}`}
                  >
                    {isDone ? <Check size={14} strokeWidth={3} /> : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <p className="mt-4 text-sm text-muted">{streakMsg}</p>
      </section>

      {pending.length > 0 && (
        <section className="mt-8">
          <p className="label mb-3">🗓️ Pendientes</p>
          <div className="space-y-2">
            {pending.map((s) => {
              const late = s.date < today;
              return (
                <div key={s.id} className="card-white flex items-center gap-3 py-4">
                  <div className="flex-1">
                    <p className="font-semibold">Entreno {s.app !== 'Libre' ? `con ${s.app}` : ''}</p>
                    <p className={`text-sm ${late ? 'text-sun' : 'text-muted'}`}>
                      {late ? 'Quedó colgado desde ' : ''}
                      {prettyDate(s.date)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => update(s.id, { status: 'done', date: today })}
                    className="rounded-full bg-sun p-2 text-white"
                    aria-label="Marcar como hecho"
                  >
                    <Check size={18} />
                  </button>
                  <button type="button" onClick={() => remove(s.id)} className="rounded-full bg-sand p-2 text-muted" aria-label="Descartar">
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-8">
        {adding ? (
          <div className="card space-y-2">
            <p className="label mb-1">¿Con qué entrenaste?</p>
            {[...apps.map((a) => `${a.emoji} ${a.name}`), ...prefs.exerciseTypes.map((t) => `🏃 ${t}`)].map((label) => (
              <button key={label} type="button" className="btn-ghost w-full justify-start" onClick={() => add(label.replace(/^\S+\s/, ''))}>
                {label}
              </button>
            ))}
            <button type="button" className="w-full pt-1 text-sm text-muted" onClick={() => setAdding(false)}>
              Cancelar
            </button>
          </div>
        ) : (
          <button type="button" className="btn-ghost w-full" onClick={() => setAdding(true)}>
            <Plus size={18} /> Registrar un entreno
          </button>
        )}
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-muted" />
          <h2 className="text-xl font-semibold">Historial reciente</h2>
        </div>
        {done.length === 0 ? (
          <div className="py-10 text-center text-muted">
            <Dumbbell size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg">Aún no hay sesiones completadas</p>
            <p className="text-sm">Empezá tu mañana activa desde la pantalla principal</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {done.slice(0, 15).map((s) => (
              <li key={s.id} className="flex items-center justify-between rounded-2xl bg-sand/60 px-4 py-3">
                <span className="font-medium">{s.app}</span>
                <span className="text-sm capitalize text-muted">{prettyDate(s.date)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
