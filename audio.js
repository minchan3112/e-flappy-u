let ctx;
let muted = false;

function audio() {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  if (!muted) audio();
  return muted;
}

export function unlockAudio() {
  audio();
}

function beep({ freq, duration = 0.12, type = "sine", gain = 0.08, slide = 0 }) {
  if (muted) return;
  const ac = audio();
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), ac.currentTime + duration);
  amp.gain.setValueAtTime(gain, ac.currentTime);
  amp.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  osc.connect(amp);
  amp.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration);
}

export const sfx = {
  ui: () => beep({ freq: 620, duration: 0.08, type: "triangle", gain: 0.05 }),
  flap: () => beep({ freq: 480, duration: 0.1, type: "square", gain: 0.05, slide: 220 }),
  score: () => {
    beep({ freq: 660, duration: 0.1, type: "sine", gain: 0.06 });
    setTimeout(() => beep({ freq: 880, duration: 0.12, type: "sine", gain: 0.05 }), 70);
  },
  crash: () => beep({ freq: 180, duration: 0.28, type: "sawtooth", gain: 0.07, slide: -120 }),
};
