// Apps y programas de ejercicio que usa Bruno.
export function exerciseApps(prefs) {
  return [
    {
      id: 'mywhoosh',
      name: 'MyWhoosh',
      emoji: '🚴',
      kind: 'Cardio en bici',
      blurb: 'Rodada virtual: elegí una salida corta si hoy viene justo.',
      links: [{ label: 'Abrir MyWhoosh', url: 'https://www.mywhoosh.com/' }],
      fits: ['Bicicleta', 'HIIT'],
    },
    {
      id: 'coreform',
      name: 'CoreForm',
      emoji: '🏋️',
      kind: 'Fuerza',
      blurb: prefs.coreformUrl
        ? 'Tu app de fuerza hecha a medida.'
        : 'Tu app de fuerza. Cargá su link en Ajustes para abrirla directo.',
      links: prefs.coreformUrl ? [{ label: 'Abrir CoreForm', url: prefs.coreformUrl }] : [],
      fits: ['Pesas', 'Calistenia'],
    },
    {
      id: 'anna',
      name: 'Grow with Anna',
      emoji: '🧘',
      kind: 'HIIT · Pilates · Fuerza en casa',
      blurb: 'Programas y videos para entrenar en casa sin equipo.',
      links: [
        { label: 'Programas', url: 'https://growwithanna.com/home-v2' },
        { label: 'YouTube', url: 'https://youtube.com/@growingannanas' },
      ],
      fits: ['Stretching', 'Yoga', 'HIIT', 'Pesas'],
    },
  ];
}

const ENERGETIC = ['Rock', 'Electrónica', 'Reggaeton', 'Pop', 'Cumbia', 'HIIT'];
const CALM = ['Lo-fi', 'Jazz', 'Clásica', 'Indie', 'R&B'];

// Sugiere un género según el tipo de mañana, siempre dentro de los gustos de la persona.
export function pickMusic(genres, type, seed = new Date().getDate()) {
  const list = genres.length ? genres : ['Lo-fi'];
  const wanted = type === 'activa' ? ENERGETIC : CALM;
  const matching = list.filter((g) => wanted.includes(g));
  const pool = matching.length ? matching : list;
  const genre = pool[seed % pool.length];
  const mood = type === 'activa' ? 'workout energy' : 'morning chill';
  const q = encodeURIComponent(`${genre} ${mood}`);
  return {
    genre,
    spotify: `https://open.spotify.com/search/${q}/playlists`,
    youtube: `https://music.youtube.com/search?q=${q}`,
  };
}
