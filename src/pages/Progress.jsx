import { Calendar, Dumbbell, Flame, Heart, Moon, Zap } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import { dateKey, parseKey, useLogs, useSessions } from '../lib/storage';
import { MORNING_TYPES } from '../lib/messages';

function Stat({ Icon, tint, label, value, sub }) {
  return (
    <div className="card-white">
      <div className="flex items-center gap-3">
        <span className={`rounded-2xl p-2.5 ${tint}`}>
          <Icon size={20} />
        </span>
        <span className="text-sm leading-tight text-muted">{label}</span>
      </div>
      <p className="mt-3 text-3xl font-bold">{value}</p>
      {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
    </div>
  );
}

function streak(logs) {
  const days = new Set(logs.map((l) => l.date));
  const d = new Date();
  if (!days.has(dateKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(dateKey(d))) {
    n += 1;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export default function Progress() {
  const [logs] = useLogs();
  const [sessions] = useSessions();
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const recent = logs.filter((l) => parseKey(l.date) >= since && l.sleep);
  const avg = (key) => {
    const vals = recent.map((l) => l[key]).filter(Boolean);
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—';
  };
  const workouts = sessions.filter((s) => s.status === 'done' && parseKey(s.date) >= since).length;
  const moodUp = recent.filter((l) => l.moodAfter && l.moodAfter > l.energy).length;
  const counts = Object.keys(MORNING_TYPES).reduce((acc, k) => ({ ...acc, [k]: recent.filter((l) => l.type === k).length }), {});

  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const key = dateKey(d);
    return { key, day: d.toLocaleDateString('es-AR', { weekday: 'narrow' }), log: logs.find((l) => l.date === key) };
  });

  return (
    <div>
      <PageTitle title="Tu Progreso" emoji="📊" subtitle="Últimos 30 días de bienestar" />

      <div className="grid grid-cols-2 gap-3">
        <Stat Icon={Moon} tint="bg-sea-soft text-sea" label="Sueño promedio" value={`${avg('sleep')}/5`} />
        <Stat Icon={Zap} tint="bg-sun-soft text-sun" label="Energía promedio" value={`${avg('energy')}/5`} />
        <Stat Icon={Dumbbell} tint="bg-rose-100 text-rose-500" label="Entrenos" value={workouts} sub={`en ${recent.length} mañanas`} />
        <Stat Icon={Heart} tint="bg-blue-100 text-blue-500" label="Ánimo mejoró" value={moodUp} sub="veces después de tu rutina" />
      </div>

      <div className="card-white mt-3 flex items-center gap-4">
        <span className="rounded-2xl bg-sun-soft p-2.5 text-sun">
          <Flame size={22} />
        </span>
        <div>
          <p className="text-2xl font-bold">{streak(logs)} días</p>
          <p className="text-sm text-muted">seguidos haciendo tu chequeo</p>
        </div>
      </div>

      <section className="card-white mt-6">
        <p className="mb-1 font-semibold">Energía al despertar → ánimo al terminar</p>
        <p className="mb-4 text-xs text-muted">
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-line" /> antes
          <span className="ml-3 mr-1 inline-block h-2 w-2 rounded-full bg-sun" /> después
        </p>
        <div className="flex h-32 items-end gap-1.5">
          {last14.map(({ key, day, log }) => (
            <div key={key} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-24 w-full items-end gap-0.5">
                <div className="flex-1 rounded-t bg-line" style={{ height: `${((log?.energy || 0) / 5) * 100}%` }} />
                <div className="flex-1 rounded-t bg-sun" style={{ height: `${((log?.moodAfter || 0) / 5) * 100}%` }} />
              </div>
              <span className="text-[10px] uppercase text-muted">{day}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card-white mt-6">
        <div className="mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-muted" />
          <h2 className="text-lg font-semibold">Tipos de mañanas</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(MORNING_TYPES).map(([k, t]) => (
            <div key={k} className="rounded-2xl bg-sand/70 py-4 text-center">
              <p className="text-2xl font-bold">{counts[k]}</p>
              <p className="text-sm text-muted">
                {t.emoji} {k === 'activa' ? 'Activas' : k === 'lenta' ? 'Lentas' : 'Descanso'}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
