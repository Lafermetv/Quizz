/**
 * Fabrique tous les sons du quiz (bruitages + musique de fond) par synthèse.
 * Aucun fichier téléchargé : 100 % original, donc aucun souci de droits.
 * Lancer : npm run sons   → écrit public/sfx/*.wav et public/musique/*.wav
 */
import fs from 'node:fs';
import path from 'node:path';

const SR = 44100;
const OUT = path.resolve('public');
const TAU = Math.PI * 2;

// ---------- utilitaires ----------
let seed = 12345;
const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const noise = () => rnd() * 2 - 1;
const buf = (sec) => new Float32Array(Math.ceil(sec * SR));
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

function biquad(type) {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0, b0 = 0, b1 = 0, b2 = 0, a1 = 0, a2 = 0;
  const set = (f, q = 0.707) => {
    f = Math.min(Math.max(f, 20), SR * 0.45);
    const w = TAU * f / SR, c = Math.cos(w), s = Math.sin(w), al = s / (2 * q);
    let n0, n1, n2;
    if (type === 'lp') { n0 = (1 - c) / 2; n1 = 1 - c; n2 = (1 - c) / 2; }
    else if (type === 'hp') { n0 = (1 + c) / 2; n1 = -(1 + c); n2 = (1 + c) / 2; }
    else { n0 = al; n1 = 0; n2 = -al; } // bp
    const d0 = 1 + al;
    b0 = n0 / d0; b1 = n1 / d0; b2 = n2 / d0; a1 = (-2 * c) / d0; a2 = (1 - al) / d0;
  };
  const run = (x) => { const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x; y2 = y1; y1 = y; return y; };
  return { set, run };
}

function writeWav(file, chans, { peak = 0.89 } = {}) {
  const ch = Array.isArray(chans) ? chans : [chans];
  const len = ch[0].length;
  let max = 1e-9;
  for (const c of ch) for (let i = 0; i < len; i++) max = Math.max(max, Math.abs(c[i]));
  const g = peak / max;
  const data = Buffer.alloc(len * ch.length * 2);
  for (let i = 0; i < len; i++) for (let k = 0; k < ch.length; k++) {
    const v = Math.max(-1, Math.min(1, ch[k][i] * g));
    data.writeInt16LE(Math.round(v * 32767), (i * ch.length + k) * 2);
  }
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8); h.write('fmt ', 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(ch.length, 22); h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * ch.length * 2, 28); h.writeUInt16LE(ch.length * 2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(data.length, 40);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.concat([h, data]));
  console.log('  ✓', path.relative(process.cwd(), file));
}

// petite réverbération (Schroeder) pour donner de l'air
function reverb(x, { mix = 0.18, size = 1 } = {}) {
  const combs = [1557, 1617, 1491, 1422].map((d) => ({ d: Math.round(d * size), b: new Float32Array(Math.round(d * size)), i: 0 }));
  const aps = [225, 556].map((d) => ({ d, b: new Float32Array(d), i: 0 }));
  const y = new Float32Array(x.length);
  for (let n = 0; n < x.length; n++) {
    let s = 0;
    for (const c of combs) { const o = c.b[c.i]; c.b[c.i] = x[n] + o * 0.78; c.i = (c.i + 1) % c.d; s += o; }
    s /= 4;
    for (const a of aps) { const o = a.b[a.i]; const v = -0.5 * s + o; a.b[a.i] = s + 0.5 * o; a.i = (a.i + 1) % a.d; s = v; }
    y[n] = x[n] * (1 - mix) + s * mix;
  }
  return y;
}

// ---------- briques sonores ----------
function addTone(out, t0, { f0, f1 = f0, dur, type = 'sine', vol = 1, attack = 0.002, curve = 6, pan }) {
  let ph = 0; const s0 = Math.round(t0 * SR), n = Math.round(dur * SR);
  for (let i = 0; i < n && s0 + i < out.length; i++) {
    const t = i / n, f = f0 * Math.pow(f1 / f0, t);
    ph += f / SR;
    const p = ph % 1;
    let v = type === 'sine' ? Math.sin(TAU * p) : type === 'tri' ? 1 - 4 * Math.abs(p - 0.5) : type === 'saw' ? 2 * p - 1 : p < 0.5 ? 1 : -1;
    const env = Math.min(1, i / (attack * SR)) * Math.exp(-curve * t);
    out[s0 + i] += v * env * vol;
  }
}
function addNoise(out, t0, { dur, vol = 1, filter = 'bp', f0 = 1000, f1 = f0, q = 1, attack = 0.002, curve = 6, shape }) {
  const fl = biquad(filter); const s0 = Math.round(t0 * SR), n = Math.round(dur * SR);
  for (let i = 0; i < n && s0 + i < out.length; i++) {
    const t = i / n;
    if (i % 16 === 0) fl.set(f0 * Math.pow(f1 / f0, t), q);
    const env = shape ? shape(t) : Math.min(1, i / (attack * SR)) * Math.exp(-curve * t);
    out[s0 + i] += fl.run(noise()) * env * vol;
  }
}
function bell(out, t0, f, vol = 1, dur = 1.6) {
  [[1, 1, 3], [2.0, 0.5, 4], [2.76, 0.35, 5], [4.07, 0.22, 7], [5.4, 0.12, 9]].forEach(([m, a, c]) =>
    addTone(out, t0, { f0: f * m, dur, vol: vol * a, curve: c, attack: 0.001 }));
}

// ---------- bruitages ----------
console.log('Bruitages :');
const S = {};
S.pop = () => { const o = buf(0.3); addTone(o, 0, { f0: 1100, f1: 260, dur: 0.12, vol: 0.9, curve: 5 }); addTone(o, 0, { f0: 140, f1: 60, dur: 0.18, vol: 0.8, curve: 7 }); addNoise(o, 0, { dur: 0.015, vol: 0.5, f0: 3000, q: 0.7 }); return o; };
S.whoosh = () => { const o = buf(0.5); addNoise(o, 0, { dur: 0.45, vol: 1, f0: 400, f1: 4000, q: 2.2, shape: (t) => Math.sin(Math.PI * Math.pow(t, 0.7)) ** 2 }); return reverb(o, { mix: 0.15 }); };
S.tic = () => { const o = buf(0.12); addTone(o, 0, { f0: 1700, dur: 0.06, vol: 0.8, curve: 9 }); addTone(o, 0, { f0: 2650, dur: 0.04, vol: 0.4, curve: 12 }); addNoise(o, 0, { dur: 0.008, vol: 0.4, f0: 5000 }); return o; };
S['tic-aigu'] = () => { const o = buf(0.14); addTone(o, 0, { f0: 2300, dur: 0.08, vol: 0.8, curve: 8 }); addTone(o, 0, { f0: 3500, dur: 0.05, vol: 0.4, curve: 12 }); addNoise(o, 0, { dur: 0.008, vol: 0.4, f0: 6000 }); return o; };
S.coeur = () => { const o = buf(0.6); [[0, 1], [0.2, 0.7]].forEach(([t, v]) => { addTone(o, t, { f0: 75, f1: 42, dur: 0.22, vol: v, curve: 6, attack: 0.004 }); addNoise(o, t, { dur: 0.05, vol: v * 0.25, filter: 'lp', f0: 300 }); }); return o; };
S.ding = () => { const o = buf(1.8); [72, 76, 79, 84].forEach((n, i) => bell(o, i * 0.06, midi(n), 0.5, 1.6)); return reverb(o, { mix: 0.25, size: 1.2 }); };
S.tampon = () => { const o = buf(0.7); addTone(o, 0, { f0: 110, f1: 40, dur: 0.4, vol: 1, curve: 5 }); addNoise(o, 0, { dur: 0.06, vol: 0.9, filter: 'lp', f0: 2200 }); addNoise(o, 0, { dur: 0.25, vol: 0.3, filter: 'bp', f0: 600, q: 0.8, curve: 9 }); return reverb(o, { mix: 0.12 }); };
S.boum = () => { const o = buf(1.4); addTone(o, 0, { f0: 140, f1: 32, dur: 1.2, vol: 1, curve: 3.5 }); addNoise(o, 0, { dur: 0.12, vol: 0.7, filter: 'lp', f0: 1800, curve: 8 }); addNoise(o, 0, { dur: 1.0, vol: 0.25, filter: 'bp', f0: 3000, f1: 300, q: 0.9, curve: 4 }); return reverb(o, { mix: 0.2 }); };
S.buzzer = () => { const o = buf(0.5); addTone(o, 0, { f0: 140, dur: 0.45, type: 'saw', vol: 0.5, curve: 1.5, attack: 0.01 }); addTone(o, 0, { f0: 147, dur: 0.45, type: 'square', vol: 0.3, curve: 1.5, attack: 0.01 }); const f = biquad('lp'); f.set(1600); return o.map((v) => f.run(v)); };
S.applaudissements = () => {
  const o = buf(3.2);
  for (let i = 0; i < 520; i++) {
    const t = rnd() * 2.6; const v = (0.4 + rnd() * 0.6) * (t < 0.3 ? t / 0.3 : t > 1.8 ? Math.max(0, 1 - (t - 1.8) / 0.8) : 1);
    addNoise(o, t, { dur: 0.02 + rnd() * 0.02, vol: v, f0: 900 + rnd() * 1800, q: 1.4, attack: 0.0005, curve: 9 });
  }
  return reverb(o, { mix: 0.3, size: 1.3 });
};
S.swoosh = () => { const o = buf(0.4); addNoise(o, 0, { dur: 0.35, vol: 1, f0: 2500, f1: 500, q: 1.6, shape: (t) => Math.sin(Math.PI * t) ** 2 }); return o; };
for (const [name, fn] of Object.entries(S)) writeWav(path.join(OUT, 'sfx', `${name}.wav`), fn());

// ---------- musique de fond (boucle 8 mesures, 120 BPM) ----------
console.log('Musique :');
function musique(bpm = 120) {
  const beat = 60 / bpm, bars = 8, len = bars * 4 * beat, tail = 2;
  const L = buf(len + tail), R = buf(len + tail);
  const drums = buf(len + tail), bass = buf(len + tail), chordsL = buf(len + tail), chordsR = buf(len + tail), lead = buf(len + tail);
  const prog = [[48, 52, 55, 59], [43, 50, 55, 59], [45, 52, 57, 60], [41, 48, 53, 57]]; // Cmaj7 · G · Am · F (2 mesures chacun)
  const pump = (t) => { const p = (t % beat) / beat; return 0.35 + 0.65 * Math.min(1, p / 0.45); };
  for (let b = 0; b < bars; b++) {
    const chord = prog[Math.floor(b / 2) % 4], t0 = b * 4 * beat;
    for (let q = 0; q < 4; q++) {
      const t = t0 + q * beat;
      addTone(drums, t, { f0: 160, f1: 45, dur: 0.32, vol: 1, curve: 5 });             // grosse caisse
      addNoise(drums, t, { dur: 0.01, vol: 0.3, f0: 4000 });
      if (q % 2 === 1) [0, 0.012, 0.024].forEach((d, k) => addNoise(drums, t + d, { dur: k < 2 ? 0.02 : 0.18, vol: 0.45, f0: 1300, q: 1.1, curve: k < 2 ? 12 : 7 })); // clap
      addNoise(drums, t, { dur: 0.035, vol: 0.12, filter: 'hp', f0: 8000, curve: 9 });   // charleston
      addNoise(drums, t + beat / 2, { dur: 0.14, vol: 0.16, filter: 'hp', f0: 7000, curve: 5 }); // charleston ouvert
      addTone(bass, t + beat / 2, { f0: midi(chord[0] - 12), dur: beat * 0.45, type: 'saw', vol: 0.55, curve: 3, attack: 0.005 });
      addTone(bass, t + beat / 2, { f0: midi(chord[0] - 24), dur: beat * 0.45, type: 'sine', vol: 0.6, curve: 2, attack: 0.005 });
    }
    [0, 0.75, 1.5, 2.5, 3.0].forEach((pos) => chord.forEach((n, k) => {
      addTone(chordsL, t0 + pos * beat, { f0: midi(n + 12) * 0.997, dur: 0.32, type: 'saw', vol: 0.12, curve: 7, attack: 0.004 });
      addTone(chordsR, t0 + pos * beat, { f0: midi(n + 12) * 1.003, dur: 0.32, type: 'saw', vol: 0.12, curve: 7, attack: 0.004 });
    }));
    if (b >= 4) for (let s = 0; s < 16; s++) {
      const n = chord[[0, 1, 2, 3, 2, 1][s % 6]] + 24;
      addTone(lead, t0 + s * beat / 4, { f0: midi(n), dur: beat / 4 * 0.9, type: 'tri', vol: 0.14, curve: 6, attack: 0.003 });
    }
  }
  const lpB = biquad('lp'); lpB.set(700, 0.9);
  const lpL = biquad('lp'), lpR = biquad('lp'); lpL.set(2600); lpR.set(2600);
  const leadR = reverb(lead, { mix: 0.35, size: 1.1 });
  for (let i = 0; i < L.length; i++) {
    const t = i / SR, p = pump(t);
    const bs = lpB.run(bass[i]) * p, cl = lpL.run(chordsL[i]) * p, cr = lpR.run(chordsR[i]) * p;
    L[i] = drums[i] * 0.8 + bs + cl + leadR[i] * 0.8;
    R[i] = drums[i] * 0.8 + bs + cr + leadR[i] * 0.6;
  }
  // boucle parfaite : on replie la traîne sur le début
  const n = Math.round(len * SR), outL = L.slice(0, n), outR = R.slice(0, n);
  for (let i = n; i < L.length; i++) { outL[i - n] += L[i]; outR[i - n] += R[i]; }
  for (let i = 0; i < n; i++) { outL[i] = Math.tanh(outL[i] * 1.2); outR[i] = Math.tanh(outR[i] * 1.2); }
  return [outL, outR];
}
writeWav(path.join(OUT, 'musique', 'boucle-120bpm.wav'), musique(120), { peak: 0.8 });
console.log('Terminé.');
