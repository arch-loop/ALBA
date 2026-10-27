import { Navigate, Route, Routes } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import AlarmOverlay from './components/AlarmOverlay';
import Morning from './pages/Morning';
import Routine from './pages/Routine';
import Progress from './pages/Progress';
import Settings from './pages/Settings';

export default function App() {
  return (
    <div className="mx-auto min-h-screen max-w-md">
      <main className="px-6 pb-32 pt-10">
        <Routes>
          <Route path="/" element={<Morning />} />
          <Route path="/rutina" element={<Routine />} />
          <Route path="/progreso" element={<Progress />} />
          <Route path="/ajustes" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
      <AlarmOverlay />
    </div>
  );
}
