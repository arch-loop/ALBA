import { dateKey, parseKey } from './storage';

export const LEVELS = [
  { value: 1, emoji: '😴', label: 'Agotado' },
  { value: 2, emoji: '😔', label: 'Bajo' },
  { value: 3, emoji: '😐', label: 'Normal' },
  { value: 4, emoji: '🙂', label: 'Bien' },
  { value: 5, emoji: '😄', label: 'Genial' },
];

export const MORNING_TYPES = {
  activa: { emoji: '🔥', title: 'Mañana activa', desc: 'Entreno, ducha y a comerse el día', color: 'bg-sun text-white' },
  lenta: { emoji: '🌿', title: 'Mañana lenta', desc: 'Sin apuro: café, luz y movimiento suave', color: 'bg-sea text-white' },
  descanso: { emoji: '🛋️', title: 'Descanso', desc: 'Hoy recargás. Sin culpa', color: 'bg-ink text-white' },
};

export const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// Siempre es un saludo de despertar, nunca "buenas noches".
export function greeting(name, now = new Date()) {
  const h = now.getHours();
  const n = name?.trim();
  const icon = h < 8 ? '🌅' : '☀️';
  let title;
  if (h < 5) title = n ? `¡Arriba, ${n}! Madrugaste` : '¡Arriba! Madrugaste';
  else if (h < 13) title = n ? `¡Hola ${n}, buen día!` : '¡Hola, buen día!';
  else title = n ? `¡Hola ${n}! Mejor tarde que nunca` : '¡Hola! Mejor tarde que nunca';
  return { icon, title };
}

export function formatToday(now = new Date()) {
  return now.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function isWinter(hemisphere, now = new Date()) {
  const m = now.getMonth(); // 0 = enero
  const cold = hemisphere === 'sur' ? [4, 5, 6, 7, 8] : [10, 11, 0, 1, 2];
  return cold.includes(m);
}

const pick = (arr, seed) => arr[Math.abs(seed) % arr.length];
const daySeed = (now = new Date()) => now.getFullYear() * 400 + now.getMonth() * 32 + now.getDate();

// Banco de mensajes por estilo y tipo de mañana. {n} = nombre.
const MESSAGES = {
  suave: {
    activa: [
      'Hoy tu cuerpo dice que sí, {n}. Arrancá despacio y dejá que el ritmo llegue solo.',
      'Moverte primero es un regalo que te hacés antes de dárselo todo al trabajo.',
      'Un paso, una pedaleada, una respiración. No hace falta más que empezar.',
    ],
    lenta: [
      'Las mañanas lentas también cuentan, {n}. Hoy la prioridad es estar bien.',
      'Tomate el café sin pantalla. El mundo puede esperar veinte minutos más.',
      'Ir despacio no es quedarse atrás: es llegar con la cabeza clara.',
    ],
    descanso: [
      'Descansar es parte del plan, {n}. Mañana volvés con más ganas.',
      'Hoy no hay nada que demostrar. Solo cuidarte.',
      'Tu cuerpo te pidió una pausa y vos lo escuchaste. Eso es entrenar también.',
    ],
  },
  energetico: {
    activa: [
      '¡Vamos, {n}! Bestia mode ON 💪 El trabajo puede esperar, tu entreno no.',
      'Cada repetición de hoy es energía que te llevás a la reunión más caótica.',
      '¡Dale que se puede! En 30 minutos sos otra persona.',
    ],
    lenta: [
      'Mañana tranqui pero con actitud, {n}. Diez minutos de movimiento y te cambia el día.',
      'Hoy bajás un cambio, no apagás el motor. ¡Arriba ese ánimo!',
      'Lento pero imparable. ¡Vamos con todo lo que sí podés!',
    ],
    descanso: [
      'Hoy cargás batería al 100%, {n}. Mañana salimos a romperla.',
      'Los campeones también descansan. ¡A disfrutar la pausa!',
      'Recuperar es parte del entreno. Hoy ganás descansando.',
    ],
  },
  filosofico: {
    activa: [
      '"Somos lo que hacemos repetidamente." Hoy hacés lo que te hace bien, {n}.',
      'El cuerpo en movimiento ordena la mente. Primero vos, después el mundo.',
      'La disciplina es elegirte cuando nadie mira.',
    ],
    lenta: [
      'No se trata de hacer más, sino de estar presente en lo que hacés, {n}.',
      'La calma de la mañana es el ancla para la tormenta del día.',
      '"Sin prisa, pero sin pausa." Hoy toca la primera parte.',
    ],
    descanso: [
      'También el campo descansa para dar fruto, {n}.',
      'Parar no es rendirse. Es elegir cuándo volver.',
      'El silencio de una mañana libre es su propio entrenamiento.',
    ],
  },
  humor: {
    activa: [
      'Buenas noticias, {n}: la cama no se va a ofender si la dejás. Las pesas sí, si no vas.',
      'Tu yo de las 18 hs te va a agradecer. Tu yo de ahora está enojado, pero ya se le pasa.',
      'Modo bestia activado 🦍 Modo zombie desactivado (casi).',
    ],
    lenta: [
      'Mañana lenta, {n}: versión perezoso premium 🦥 pero con desayuno de campeón.',
      'Hoy el café va primero y las decisiones importantes después. Como debe ser.',
      'Spoiler: estirarte 5 minutos cuenta como deporte de alto rendimiento (para la frazada).',
    ],
    descanso: [
      'Día de descanso oficial, {n}. Firmado: el sillón 🛋️',
      'Hoy tu único entreno es levantar la taza. Hidratate igual.',
      'Recargando batería... 37%... 58%... no apures la barrita.',
    ],
  },
};

const AFFIRMATIONS = [
  'Primero vos.',
  'Tu cuerpo es tu casa.',
  'Hoy elegís cómo empezar.',
  'Respirá. Estás a tiempo.',
  'Pequeños pasos, grandes mañanas.',
  'Energía que se contagia.',
  'Tenés todo lo que necesitás.',
  'El día empieza cuando vos decidís.',
];

export function motivationalMessage(prefs, type, extraSeed = 0) {
  const style = MESSAGES[prefs.motivationStyle] || MESSAGES.humor;
  const msg = pick(style[type] || style.lenta, daySeed() + extraSeed);
  const name = prefs.name?.trim() || 'campeón';
  return msg.replaceAll('{n}', name);
}

export function affirmations() {
  return AFFIRMATIONS;
}

// Sugerencia adaptativa: mezcla cómo dormiste, la energía, el día de descanso y tus últimas mañanas.
export function suggestMorning({ sleep, energy, prefs, logs, now = new Date() }) {
  const score = sleep + energy; // 2..10
  const restDay = prefs.restDays.includes(now.getDay());
  const recent = [...logs]
    .filter((l) => l.date < dateKey(now))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
  const calmStreak = recent.filter((l) => l.type !== 'activa').length;
  const lastWasConsecutive = recent[0] && (now - parseKey(recent[0].date)) / 864e5 < 2.5;

  let type;
  let reason;
  if (score <= 4) {
    type = 'lenta';
    reason = 'Dormiste poco o estás bajo de energía: hoy mañana lenta y te subimos el ánimo de a poco. El entreno lo movemos para más tarde.';
  } else if (restDay && score < 9) {
    type = 'descanso';
    reason = `Hoy es ${WEEKDAYS[now.getDay()].toLowerCase()}, uno de tus días de descanso. Si igual tenés ganas, elegí activa.`;
  } else if (score >= 8) {
    type = 'activa';
    reason = '¡Estás con todo! Es un gran día para entrenar.';
  } else if (calmStreak >= 2 && lastWasConsecutive && score >= 6) {
    type = 'activa';
    reason = 'Venís de un par de mañanas tranquilas y hoy estás bien. ¿Probamos algo corto y activo?';
  } else if (prefs.morningPref === 'alta' && score >= 6) {
    type = 'activa';
    reason = 'Te gustan las mañanas con energía y hoy acompaña.';
  } else {
    type = 'lenta';
    reason = 'Energía normal: mañana lenta con algo de movimiento suave. Si te entusiasmás, pasá a activa.';
  }
  return { type, reason };
}

// Pasos de la rutina según el tipo de mañana (y si es invierno).
export function routineSteps(type, { winter }) {
  const wake = winter
    ? [{ id: 'luz', emoji: '💡', text: 'Prendé todas las luces o abrí la cortina apenas te levantás' }]
    : [{ id: 'luz', emoji: '🌤️', text: 'Abrí la ventana: 2 minutos de luz natural' }];
  const water = { id: 'agua', emoji: '💧', text: 'Un vaso grande de agua' };

  if (type === 'activa') {
    return [
      water,
      ...wake,
      { id: 'movilidad', emoji: '🤸', text: '5 minutos de movilidad para despertar el cuerpo' },
      { id: 'entreno', emoji: '💪', text: 'Entrenamiento (elegí tu app abajo)', exercise: true },
      { id: 'ducha', emoji: '🚿', text: 'Ducha (terminá con 15 segundos de agua fría si te animás)' },
      { id: 'desayuno', emoji: '🍳', text: 'Desayuno con proteína' },
      { id: 'respirar', emoji: '🫁', text: '3 respiraciones profundas antes de abrir el trabajo' },
    ];
  }
  if (type === 'lenta') {
    return [
      water,
      ...wake,
      { id: 'estirar', emoji: '🧘', text: '5 minutos de estiramiento suave' },
      { id: 'cafe', emoji: '☕', text: 'Café o mate sin pantallas' },
      { id: 'mente', emoji: '📝', text: 'Escribí 3 cosas: cómo estás, qué querés hoy, algo que agradecés' },
      { id: 'desayuno', emoji: '🥣', text: 'Desayuno rico y sin apuro' },
      { id: 'musica', emoji: '🎵', text: 'Una canción que te levante el ánimo' },
    ];
  }
  return [
    water,
    { id: 'desayuno', emoji: '🥐', text: 'Desayuno tranqui, como te guste' },
    { id: 'caminar', emoji: '🚶', text: 'Opcional: caminata corta al sol' },
    { id: 'disfrutar', emoji: '🎧', text: 'Algo que disfrutes: música, serie, lectura' },
  ];
}

export function winterTips() {
  return [
    'Dejá el celular lejos de la cama: te obliga a levantarte para apagarlo.',
    'Prepará la ropa (y medias abrigadas) a mano la noche anterior.',
    'Programá la calefacción o el aire 15 minutos antes de despertarte.',
    'Luz fuerte apenas te levantás: le avisa al cerebro que ya es de día.',
    'Primer objetivo: solo sentarte en la cama. El resto viene solo.',
  ];
}

export function generalTips() {
  return [
    'Acostate a la misma hora: el despertar fácil empieza la noche anterior.',
    'Evitá posponer la alarma: cada "5 minutos más" te deja más dormido.',
    'Un vaso de agua al lado de la cama para tomarlo apenas abrís los ojos.',
    'Si dormiste poco, no te castigues: mañana lenta y entreno más tarde.',
  ];
}

export function closingMessage(before, after) {
  if (after > before) return { emoji: '🚀', text: '¡Subiste el ánimo! Eso es empezar el día ganando.' };
  if (after === before && after >= 4) return { emoji: '😎', text: 'Arrancaste bien y seguís arriba. Imparable.' };
  if (after === before) return { emoji: '🌱', text: 'Estable y presente. Mañana vamos por un poquito más.' };
  return { emoji: '🫶', text: 'Hay días así. Ya hiciste algo por vos, y eso cuenta.' };
}
