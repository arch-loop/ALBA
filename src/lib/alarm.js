// Despertador dentro del navegador: sonido suave que va subiendo + voz con un mensaje.
// Funciona mientras Alba esté abierta (ideal: celular cargando, pantalla encendida).

let ctx = null;
let loopTimer = null;
let wakeLock = null;

function audio() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// Llamar desde un toque del usuario para que el navegador permita sonar más tarde.
export function unlockAudio() {
  try {
    audio();
  } catch {
    /* sin audio disponible */
  }
}

function chime(volume) {
  const ac = audio();
  const notes = [523.25, 659.25, 783.99, 1046.5]; // Do mayor ascendente
  notes.forEach((freq, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t = ac.currentTime + i * 0.35;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 1.3);
  });
}

export function speak(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'es-AR';
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang?.startsWith('es'));
  if (voice) u.voice = voice;
  u.rate = 0.95;
  window.speechSynthesis.speak(u);
}

// Sonido creciente: arranca muy bajito y sube durante ~1 minuto.
export function startRinging(message, withVoice) {
  stopRinging();
  let round = 0;
  const tick = () => {
    const volume = Math.min(0.05 + round * 0.04, 0.6);
    chime(volume);
    if (withVoice && message && round % 4 === 2) speak(message);
    round += 1;
  };
  tick();
  loopTimer = setInterval(tick, 3000);
  if (navigator.vibrate) navigator.vibrate([400, 200, 400]);
}

export function stopRinging() {
  if (loopTimer) clearInterval(loopTimer);
  loopTimer = null;
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

export async function keepScreenOn(on) {
  try {
    if (on && 'wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
    else if (!on && wakeLock) {
      await wakeLock.release();
      wakeLock = null;
    }
  } catch {
    /* el navegador no lo permite; no es crítico */
  }
}

// Próxima ocurrencia de HH:MM (hoy si todavía no pasó, si no mañana).
export function nextAlarm(hhmm, now = new Date()) {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(now);
  d.setHours(h, m, 0, 0);
  if (d <= now) d.setDate(d.getDate() + 1);
  return d;
}

// Archivo de calendario con una alarma diaria: respaldo para cuando Alba está cerrada.
export function alarmIcs(hhmm, message) {
  const start = nextAlarm(hhmm);
  const pad = (n) => String(n).padStart(2, '0');
  const stamp = (d) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const end = new Date(start.getTime() + 15 * 60000);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Alba//ES',
    'BEGIN:VEVENT',
    `UID:alba-despertar-${Date.now()}@alba`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    'RRULE:FREQ=DAILY',
    'SUMMARY:☀️ Alba: primero vos, después el mundo',
    `DESCRIPTION:${message.replace(/[,;]/g, ' ')} — Abrí Alba para tu chequeo.`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:¡Buen día! Abrí Alba',
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}
