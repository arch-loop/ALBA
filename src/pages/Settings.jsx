import { useState } from 'react';
import { Download, Plus, Save, Upload, X } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import { exportData, importData, usePrefs } from '../lib/storage';
import { WEEKDAYS } from '../lib/messages';

const MORNING_PREFS = [
  ['lenta', '🌿 Lenta y consciente'],
  ['moderada', '☕ Moderada'],
  ['alta', '🔥 Alta energía'],
];

const STYLES = [
  ['suave', '🤗 Suave', 'Cariñoso y comprensivo'],
  ['energetico', '⚡ Energético', 'Potente y motivador'],
  ['filosofico', '🧘 Filosófico', 'Profundo y reflexivo'],
  ['humor', '😄 Con humor', 'Divertido y ligero'],
];

const MUSIC_SUGGESTIONS = ['Pop', 'Reggaeton', 'Clásica', 'R&B', 'Indie', 'Cumbia', 'Rock', 'Jazz', 'Lo-fi', 'Electrónica'];
const EXERCISE_SUGGESTIONS = ['Yoga', 'Correr', 'HIIT', 'Calistenia', 'Natación', 'Caminata', 'Bicicleta', 'Pesas', 'Stretching'];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function TagEditor({ values, suggestions, onChange }) {
  const [text, setText] = useState('');
  const add = (v) => {
    const clean = v.trim();
    if (clean && !values.some((x) => x.toLowerCase() === clean.toLowerCase())) onChange([...values, clean]);
    setText('');
  };
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {values.map((v) => (
          <span key={v} className="chip flex items-center gap-1.5 bg-sand font-semibold">
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} aria-label={`Quitar ${v}`}>
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          add(text);
        }}
      >
        <input className="input py-2.5 text-base" placeholder="Agregar…" value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit" className="btn-ghost px-4" aria-label="Agregar">
          <Plus size={20} />
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {suggestions
          .filter((s) => !values.includes(s))
          .map((s) => (
            <button key={s} type="button" className="chip bg-sand/60 text-muted" onClick={() => add(s)}>
              + {s}
            </button>
          ))}
      </div>
    </div>
  );
}

export default function Settings() {
  const [saved, setSaved] = usePrefs();
  const [prefs, setDraft] = useState(saved);
  const [toast, setToast] = useState('');
  const set = (patch) => setDraft((p) => ({ ...p, ...patch }));
  const dirty = JSON.stringify(prefs) !== JSON.stringify(saved);

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  const save = () => {
    setSaved(prefs);
    flash('¡Guardado! ✨');
  };

  const download = () => {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `alba-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const upload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((txt) => {
      try {
        importData(txt);
        window.location.reload();
      } catch {
        flash('Ese archivo no parece un backup de Alba 🤔');
      }
    });
  };

  return (
    <div>
      <PageTitle title="Ajustes" emoji="⚙️" subtitle="Personalizá tu experiencia" />

      <Section title="Tu nombre">
        <input className="input" value={prefs.name} placeholder="¿Cómo te llamás?" onChange={(e) => set({ name: e.target.value })} />
      </Section>

      <Section title="Hora de despertar ideal">
        <input type="time" className="input" value={prefs.wakeTime} onChange={(e) => set({ wakeTime: e.target.value })} />
        <label className="mt-3 flex items-center gap-3 text-ink/80">
          <input type="checkbox" className="h-5 w-5 accent-sun" checked={prefs.voice} onChange={(e) => set({ voice: e.target.checked })} />
          Que el despertador me hable con un mensaje
        </label>
      </Section>

      <Section title="Preferencia general de mañanas">
        <div className="grid grid-cols-3 gap-2">
          {MORNING_PREFS.map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => set({ morningPref: k })}
              className={`rounded-2xl px-2 py-4 text-sm font-medium transition ${prefs.morningPref === k ? 'bg-sun text-white' : 'bg-sand/70 text-muted'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Estilo de mensajes motivacionales">
        <div className="grid grid-cols-2 gap-2">
          {STYLES.map(([k, title, desc]) => (
            <button
              key={k}
              type="button"
              onClick={() => set({ motivationStyle: k })}
              className={`rounded-2xl p-4 text-left transition ${prefs.motivationStyle === k ? 'bg-sun text-white' : 'bg-sand/70'}`}
            >
              <span className="block text-lg font-semibold">{title}</span>
              <span className={`text-xs ${prefs.motivationStyle === k ? 'text-white/85' : 'text-muted'}`}>{desc}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="🎵 Géneros musicales favoritos">
        <TagEditor values={prefs.musicGenres} suggestions={MUSIC_SUGGESTIONS} onChange={(musicGenres) => set({ musicGenres })} />
      </Section>

      <Section title="💪 Tipos de ejercicio">
        <TagEditor values={prefs.exerciseTypes} suggestions={EXERCISE_SUGGESTIONS} onChange={(exerciseTypes) => set({ exerciseTypes })} />
      </Section>

      <Section title="🔗 Link de CoreForm">
        <input
          className="input text-base"
          type="url"
          placeholder="https://tu-coreform.base44.app"
          value={prefs.coreformUrl}
          onChange={(e) => set({ coreformUrl: e.target.value })}
        />
        <p className="mt-2 text-sm text-muted">Pegá la dirección de tu app CoreForm para abrirla directo desde la mañana activa.</p>
      </Section>

      <Section title="Días de descanso preferidos">
        <div className="flex flex-wrap gap-2">
          {WEEK_ORDER.map((d) => {
            const on = prefs.restDays.includes(d);
            return (
              <button
                key={d}
                type="button"
                className={`chip ${on ? 'bg-sun text-white' : 'bg-sand/70 text-muted'}`}
                onClick={() => set({ restDays: on ? prefs.restDays.filter((x) => x !== d) : [...prefs.restDays, d] })}
              >
                {WEEKDAYS[d]}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="¿Dónde vivís?">
        <div className="grid grid-cols-2 gap-2">
          {[
            ['sur', '🌎 Hemisferio sur'],
            ['norte', '🌍 Hemisferio norte'],
          ].map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => set({ hemisphere: k })}
              className={`rounded-2xl py-3 text-sm font-medium ${prefs.hemisphere === k ? 'bg-sun text-white' : 'bg-sand/70 text-muted'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">Así Alba sabe cuándo es invierno y te da tips para las mañanas frías.</p>
      </Section>

      <Section title="Tus datos">
        <p className="mb-3 text-sm text-muted">Todo se guarda en este dispositivo. Hacé un backup para pasarlo a otro celu.</p>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="btn-ghost text-sm" onClick={download}>
            <Download size={16} /> Exportar
          </button>
          <label className="btn-ghost cursor-pointer text-sm">
            <Upload size={16} /> Importar
            <input type="file" accept="application/json" className="hidden" onChange={upload} />
          </label>
        </div>
      </Section>

      <div className="sticky bottom-24 z-20">
        <button type="button" className="btn-primary" onClick={save} disabled={!dirty}>
          <Save size={20} /> {dirty ? 'Guardar preferencias' : 'Todo guardado ✓'}
        </button>
      </div>

      {toast && (
        <div className="fixed inset-x-0 top-6 z-50 mx-auto w-fit animate-rise rounded-full bg-ink px-5 py-2.5 text-white shadow-lg">{toast}</div>
      )}
    </div>
  );
}
