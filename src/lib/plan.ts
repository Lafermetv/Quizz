/**
 * Le minutage de toute la vidéo, calé sur le tempo de la musique (120 BPM = 1 temps toutes les 0,5 s).
 * Tout est calculé en « temps » (beats) puis converti en images, sans dérive.
 */
export const BPM = 120;
export const INTRO_BEATS = 3; // 1,5 s : le premier film arrive avant 2 s
export const REVEAL_BEATS = 4; // 2 s de réponse
export const OUTRO_BEATS = 10; // 5 s d'écran de fin
export const WIPE_SECONDS = 0.4; // transition entre deux manches

export type RoundPlan = {
  from: number; // début de la séquence (début de la transition)
  start: number; // transition terminée (temps 0 de la manche)
  lands: number[]; // arrivée de chaque emoji
  thinkStart: number;
  thinkEnd: number;
  revealStart: number;
  end: number;
};

export type Plan = {
  fps: number;
  beatFrames: number;
  wipe: number;
  intro: { from: number; end: number };
  rounds: RoundPlan[];
  outro: { from: number; start: number; end: number };
  total: number;
};

export const makePlan = (emojiCounts: number[], thinkSeconds: number, fps: number): Plan => {
  const spb = 60 / BPM;
  const fr = (beats: number) => Math.round(beats * spb * fps);
  const wipe = Math.round(WIPE_SECONDS * fps);
  const thinkBeats = Math.max(2, Math.round(thinkSeconds / spb));
  const roundBeats = 1 + thinkBeats + REVEAL_BEATS;

  const rounds = emojiCounts.map((n, i) => {
    const b0 = INTRO_BEATS + i * roundBeats;
    return {
      from: fr(b0) - wipe,
      start: fr(b0),
      // les emojis tombent sur les croches : 0,5 · 1 · 1,5 · 2 temps
      lands: Array.from({ length: n }, (_, k) => fr(b0 + 0.5 + k * 0.5)),
      thinkStart: fr(b0 + 1),
      thinkEnd: fr(b0 + 1 + thinkBeats),
      revealStart: fr(b0 + 1 + thinkBeats),
      end: fr(b0 + roundBeats),
    };
  });
  const ob = INTRO_BEATS + emojiCounts.length * roundBeats;
  return {
    fps,
    beatFrames: spb * fps,
    wipe,
    intro: { from: 0, end: fr(INTRO_BEATS) },
    rounds,
    outro: { from: fr(ob) - wipe, start: fr(ob), end: fr(ob + OUTRO_BEATS) },
    total: fr(ob + OUTRO_BEATS),
  };
};
