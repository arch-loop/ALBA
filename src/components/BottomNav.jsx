import { NavLink } from 'react-router-dom';
import { BarChart3, Dumbbell, Settings, Sun } from 'lucide-react';

const ITEMS = [
  { to: '/', label: 'Mañana', Icon: Sun },
  { to: '/rutina', label: 'Rutina', Icon: Dumbbell },
  { to: '/progreso', label: 'Progreso', Icon: BarChart3 },
  { to: '/ajustes', label: 'Ajustes', Icon: Settings },
];

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-md justify-around py-3">
        {ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex w-20 flex-col items-center gap-1 text-sm ${isActive ? 'font-semibold text-sun' : 'text-muted'}`
            }
          >
            <Icon size={24} strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
