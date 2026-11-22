import React from 'react';
import { Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { AnswerImage, Film } from '../lib/packs';
import type { RoundPlan } from '../lib/plan';
import { inkOn, type Palette } from '../lib/theme';
import { TEXT_FONT, TITLE_FONT } from '../lib/fonts';
import { Background, BACKGROUNDS } from './Background';
import { Confetti } from './Confetti';
import { Emoji } from './Emoji';
import { Sfx } from './Sfx';
import { Wipe } from './Wipe';
import { DevineWord, fitFont } from './DevineTitle';

const W = 1080;
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const Round: React.FC<{
  film: Film;
  index: number;
  total: number;
  plan: RoundPlan; // en images absolues
  palette: Palette;
  beatFrames: number;
  wipe: number;
  devine: string;
  image: AnswerImage;
}> = ({ film, index, total, plan, palette, beatFrames, wipe, devine, image }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // tout en images relatives au début de la séquence
  const o = plan.from;
  const start = plan.start - o;
  const lands = plan.lands.map((l) => l - o);
  const thinkStart = plan.thinkStart - o;
  const thinkEnd = plan.thinkEnd - o;
  const reveal = plan.revealStart - o;
  const think = Math.round((thinkEnd - thinkStart) / fps);

  // ----- étoile -----
  const star = spring({ frame: frame - start + 4, fps, config: { damping: 10, stiffness: 170, mass: 0.7 } });

  // ----- emojis -----
  const n = film.emojis.length;
  const size = n > 3 ? 205 : 250;
  const r = spring({ frame: frame - reveal, fps, config: { damping: 15, stiffness: 120 } });

  // ----- chrono -----
  const left = interpolate(frame, [thinkStart, thinkEnd], [1, 0], clamp);
  const sec = frame < thinkStart ? think : Math.max(1, Math.ceil(left * think - 1e-6));
  const changedAt = frame < thinkStart ? -999 : thinkStart + (think - sec) * fps;
  const beat = 1 + 0.5 * Math.pow(interpolate(frame - changedAt, [0, 0.35 * fps], [1, 0], clamp), 2);
  const timerFade = interpolate(frame, [reveal, reveal + 0.3 * fps], [1, 0], clamp);
  const barColor = left > 0.5 ? 'linear-gradient(#7dff5a,#2fd23b)' : left > 0.25 ? 'linear-gradient(#ffe45a,#ffb800)' : 'linear-gradient(#ff7a6b,#ff3b30)';
  const barInner = W - 2 * 130 - 22;

  // ----- réponse -----
  const ans = spring({ frame: frame - reveal - Math.round(0.15 * fps), fps, config: { damping: 9, stiffness: 150, mass: 0.7 } });
  const title = film.title;
  const poster = image;
  // l'image garde ses proportions : au plus 860 × 705, posée juste au-dessus du titre
  const fit = poster ? Math.min(860 / poster.w, 705 / poster.h) : 1;
  const imgW = poster ? Math.round(poster.w * fit) : 0;
  const imgH = poster ? Math.round(poster.h * fit) : 0;
  const imgLeft = 540 - imgW / 2;
  // centrée entre les emojis (en haut) et la zone sûre du bas ; le titre chevauche un peu le bas de l'image
  const imgTop = Math.round(952 - imgH / 2);
  const overlap = Math.min(80, Math.round(imgH * 0.12));
  const labelTop = imgTop + imgH - overlap;
  const titleSize = poster ? (title.length > 26 ? 66 : title.length > 17 ? 80 : 96) : title.length > 26 ? 86 : title.length > 17 ? 100 : 119;
  // affiche : arrive en « coup de tampon » avec un flash blanc et une petite secousse
  const ps = spring({ frame: frame - reveal, fps, config: { damping: 11, stiffness: 170, mass: 0.8 } });
  const flash = interpolate(frame, [reveal, reveal + 7], [0.75, 0], clamp);
  const hit = frame - reveal - 3;
  const shake = poster && hit >= 0 && hit < 9 ? Math.sin(hit * 2.9) * (9 - hit) * 2.2 : 0;
  const lbl = spring({ frame: frame - reveal - Math.round(0.2 * fps), fps, config: { damping: 9, stiffness: 160, mass: 0.7 } });

  return (
    <Wipe duration={wipe} color={palette.acc}>
      <Background palette={palette} beatFrames={beatFrames} beatOffset={start} style={BACKGROUNDS[index % BACKGROUNDS.length]} />

      {/* étoile + numéro */}
      <div style={{ position: 'absolute', left: 65, top: 205, width: 184, height: 184, display: 'grid', placeItems: 'center', transform: `scale(${star}) rotate(${(1 - star) * -20}deg)` }}>
        <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', filter: 'drop-shadow(0 11px 0 rgba(0,0,0,.22))' }}>
          <path d="M50 4l13.6 28.4 31 3.8-22.8 21.4 5.9 30.8L50 73.2 22.3 88.4l5.9-30.8L5.4 36.2l31-3.8z" fill="#3b2bd9" stroke="#fff" strokeWidth={6} strokeLinejoin="round" />
        </svg>
        <b style={{ position: 'relative', font: `60px ${TITLE_FONT}`, color: '#fff', marginTop: 11 }}>{index + 1}</b>
      </div>

      {/* compteur */}
      <div style={{ position: 'absolute', right: 65, top: 245, font: `700 48px ${TEXT_FONT}`, color: '#fff', background: 'rgba(0,0,0,.22)', padding: '13px 32px', borderRadius: 97 }}>
        {index + 1}/{total}
      </div>

      {/* titre */}
      <h1 style={{ opacity: poster ? 1 - r : 1, margin: 0, position: 'absolute', top: 405, width: '100%', textAlign: 'center', font: `${fitFont(`DEVINE ${devine}`, 113)}px/1 ${TITLE_FONT}`, letterSpacing: '0.02em', color: '#fff', textShadow: '0 12px 0 rgba(0,0,0,.25)' }}>
        DEVINE <DevineWord devine={devine} acc={palette.acc} />
      </h1>

      {/* les emojis */}
      <div
        style={{
          position: 'absolute',
          top: 600,
          left: 54,
          right: 54,
          height: 460,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignContent: 'center',
          gap: '38px 54px',
          transform: poster ? `translateY(${-335 * r}px) scale(${1 - 0.5 * r})` : `translateY(${-80 * r}px) scale(${1 - 0.38 * r})`,
        }}
      >
        {film.emojis.map((e, k) => {
          const p = spring({ frame: frame - lands[k] + 4, fps, config: { damping: 9, stiffness: 160, mass: 0.7 } });
          const since = Math.max(0, frame - lands[k]);
          const fl = Math.sin((since / (2.4 * fps)) * Math.PI * 2);
          return (
            <div key={k} style={{ transform: `translateY(${-15 * fl}px) rotate(${3 * fl + (1 - p) * -20}deg) scale(${p})`, opacity: frame < lands[k] - 4 ? 0 : 1 }}>
              <Emoji emoji={e} size={size} />
            </div>
          );
        })}
      </div>

      {/* chrono */}
      <div style={{ position: 'absolute', top: 1152, left: 130, right: 130, height: 69, borderRadius: 65, background: 'rgba(255,255,255,.35)', boxShadow: 'inset 0 0 0 11px rgba(255,255,255,.9), 0 11px 0 rgba(0,0,0,.18)', opacity: timerFade }}>
        <div style={{ position: 'absolute', left: 11, top: 11, bottom: 11, borderRadius: 54, background: barColor, width: barInner * left }} />
        <svg viewBox="0 0 24 24" style={{ position: 'absolute', top: '50%', left: 11 + barInner * left, width: 97, height: 97, transform: 'translate(-50%,-50%)', filter: 'drop-shadow(0 6px 0 rgba(0,0,0,.25))' }}>
          <path d="M14 1L4 14h6l-2 9 11-14h-6z" fill="#d7ff2e" stroke="#ff4d6d" strokeWidth={1.6} strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{ position: 'absolute', top: 1262, width: '100%', textAlign: 'center', font: `140px/1 ${TITLE_FONT}`, color: '#fff', textShadow: '0 11px 0 rgba(0,0,0,.22)', transform: `scale(${beat})`, opacity: timerFade }}>
        {sec}
      </div>

      {/* réponse */}
      {frame >= reveal && poster && (
        <div style={{ position: 'absolute', inset: 0, transform: `translate(${shake}px, ${shake * 0.5}px)` }}>
          <div style={{ position: 'absolute', left: imgLeft, top: imgTop, width: imgW, height: imgH, transform: `scale(${1.7 - 0.7 * ps}) rotate(${-3 + (1 - ps) * 10}deg)`, opacity: Math.min(1, ps * 2.5) }}>
            <Img src={poster.src} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 26, border: '12px solid #fff', background: '#fff', boxShadow: '0 26px 50px rgba(0,0,0,.35)', boxSizing: 'border-box', display: 'block' }} />
            {film.year ? (
              <div style={{ position: 'absolute', right: -46, top: -34, transform: `rotate(12deg) scale(${lbl})`, font: `50px/1 ${TITLE_FONT}`, background: palette.acc, color: inkOn(palette.acc), padding: '18px 22px 12px', borderRadius: 26, boxShadow: '0 8px 0 rgba(0,0,0,.22)' }}>{film.year}</div>
            ) : null}
            {poster.credit ? (
              <div style={{ position: 'absolute', right: '100%', bottom: 14, marginRight: 10, height: imgH - 28, writingMode: 'vertical-rl', transform: 'rotate(180deg)', font: `600 21px/1 ${TEXT_FONT}`, color: '#fff', opacity: 0.85, textShadow: '0 2px 4px rgba(0,0,0,.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {poster.credit}
              </div>
            ) : null}
          </div>
          <div style={{ position: 'absolute', top: labelTop, left: 40, right: 40, textAlign: 'center', transform: `scale(${lbl}) rotate(${(1 - lbl) * -14}deg)`, opacity: Math.min(1, lbl * 3) }}>
            <div style={{ display: 'inline-block', font: `${titleSize}px/1.04 ${TITLE_FONT}`, textWrap: 'balance', background: '#fff', color: palette.c2, padding: '26px 50px 18px', borderRadius: 44, boxShadow: '0 15px 0 rgba(0,0,0,.2)', transform: 'rotate(-2deg)', maxWidth: 1000 }}>
              {title}
            </div>
          </div>
        </div>
      )}
      {frame >= reveal && !poster && (
        <div style={{ position: 'absolute', top: 905, left: 54, right: 54, textAlign: 'center', transform: `scale(${ans}) rotate(${(1 - ans) * -20}deg)`, opacity: Math.min(1, ans * 3) }}>
          <div style={{ font: `700 50px ${TEXT_FONT}`, color: '#fff', opacity: 0.92, marginBottom: 30 }}>C'était…</div>
          <div
            style={{
              display: 'inline-block',
              font: `${titleSize}px/1.04 ${TITLE_FONT}`,
              textWrap: 'balance',
              background: '#fff',
              color: palette.c2,
              padding: '32px 60px 22px',
              borderRadius: 54,
              boxShadow: '0 17px 0 rgba(0,0,0,.2)',
              transform: 'rotate(-2deg)',
              maxWidth: 972,
            }}
          >
            {title}
          </div>
          {film.year ? (
            <div style={{ marginTop: 34 }}>
              <span style={{ font: `700 46px ${TEXT_FONT}`, color: '#fff', background: 'rgba(0,0,0,.22)', padding: '8px 30px', borderRadius: 60 }}>{film.year}</span>
            </div>
          ) : null}
        </div>
      )}
      {poster && frame >= reveal && <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: flash }} />}
      <Confetti at={reveal} x={540} y={poster ? 950 : 1060} seed={`c${index}`} />

      {/* sons */}
      <Sfx at={0} name="whoosh" volume={0.55} />
      {lands.map((l, k) => <Sfx key={k} at={l - 1} name="pop" volume={0.8} />)}
      {Array.from({ length: think }, (_, k) => <Sfx key={`t${k}`} at={thinkStart + k * fps} name={think - k <= 2 ? 'tic-aigu' : 'tic'} volume={0.55} />)}
      <Sfx at={reveal} name="ding" volume={0.75} />
      {poster && <Sfx at={reveal + 3} name="tampon" volume={0.7} />}
    </Wipe>
  );
};

