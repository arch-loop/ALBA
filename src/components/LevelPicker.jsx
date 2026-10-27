import { LEVELS } from '../lib/messages';

export default function LevelPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {LEVELS.map((l) => {
        const active = value === l.value;
        return (
          <button
            key={l.value}
            type="button"
            onClick={() => onChange(l.value)}
            className={`flex flex-col items-center gap-1 rounded-2xl py-3 transition active:scale-95 ${
              active ? 'scale-105 bg-sun-soft shadow-sm' : 'bg-cream/60 opacity-60'
            }`}
          >
            <span className={`text-3xl ${active ? 'animate-pop' : 'grayscale-[40%]'}`}>{l.emoji}</span>
            <span className={`text-xs ${active ? 'font-semibold text-sun' : 'text-muted'}`}>{l.label}</span>
          </button>
        );
      })}
    </div>
  );
}
