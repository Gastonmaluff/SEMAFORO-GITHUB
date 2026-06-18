// ============================================================
//  SONIDO
//  Genera tonos con Web Audio API (no requiere archivos de audio).
//  Suena al pasar a verde (éxito) o rojo (fallo).
// ============================================================

let ctx = null;

function getCtx() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
  }
  return ctx;
}

// Algunos navegadores (incluido el de la Steam Deck) bloquean el audio hasta
// que hay una interacción del usuario. Llamá a esto en el primer click/tecla.
export function unlockAudio() {
  const c = getCtx();
  if (c && c.state === "suspended") c.resume();
}

function beep(c, freq, startAt, duration, gain = 0.2) {
  const osc = c.createOscillator();
  const vol = c.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  vol.gain.setValueAtTime(0, startAt);
  vol.gain.linearRampToValueAtTime(gain, startAt + 0.02);
  vol.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(vol);
  vol.connect(c.destination);
  osc.start(startAt);
  osc.stop(startAt + duration);
}

// Acorde ascendente y alegre para el éxito.
export function playSuccess() {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume();
  const t = c.currentTime;
  beep(c, 660, t, 0.18);
  beep(c, 880, t + 0.16, 0.18);
  beep(c, 1175, t + 0.32, 0.3);
}

// Tono grave y descendente para el fallo.
export function playFailure() {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume();
  const t = c.currentTime;
  beep(c, 330, t, 0.25, 0.25);
  beep(c, 220, t + 0.22, 0.35, 0.25);
}
