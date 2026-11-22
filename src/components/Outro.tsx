import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { TEXT_FONT, TITLE_FONT } from '../lib/fonts';
import type { Palette } from '../lib/theme';
import { Background } from './Background';
import { Emoji, EmojiText } from './Emoji';
import { Sfx } from './Sfx';
import { Wipe } from './Wipe';

/** Écran de fin : barème + incitation à commenter et à s'abonner. */
export const Outro: React.FC<{ palette: Palette; count: number; part?: number; totalParts?: number; beatFrames: number; wipe: number; bareme?: string[] }> = ({ palette, count, part, totalParts, beatFrames, wipe, bareme }) => {
  const frame = useCurrentFrame() - wipe;
  const { fps } = useVideoConfig();
  const sp = (at: number) => spring({ frame: frame - at, fps, config: { damping: 10, stiffness: 160, mass: 0.7 } });
  const lowMax = Math.round(count * 0.3);
  const midMax = Math.round(count * 0.7);
  const labels = bareme && bareme.length >= 3 ? bareme : ["T'as jamais vu un film 🙈", 'Cinéphile du dimanche 🍿', 'Expert du cinéma 🏆'];
  const rows = [`0-${lowMax} · ${labels[0]}`, `${lowMax + 1}-${midMax} · ${labels[1]}`, `${midMax + 1}-${count} · ${labels[2]}`];
  const next = part && totalParts && part < totalParts ? `Abonne-toi pour la partie ${part + 1} 🔔` : part ? `Abonne-toi pour d'autres quiz 🔔` : `Abonne-toi pour la partie 2 🔔`;
  const trophy = sp(0);
  const float = Math.sin((Math.max(0, frame) / (2.4 * fps)) * Math.PI * 2);
  return (
    <Wipe duration={wipe} color={palette.acc}>
      <Background palette={palette} beatFrames={beatFrames} beatOffset={wipe} />
      <div style={{ position: 'absolute', top: 250, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `translateY(${-14 * float}px) scale(${trophy}) rotate(${(1 - trophy) * -20 + 3 * float}deg)` }}>
        <Emoji emoji="🏆" size={290} />
      </div>
      <div style={{ position: 'absolute', top: 590, width: '100%', textAlign: 'center', font: `150px/0.95 ${TITLE_FONT}`, color: '#fff', textShadow: '0 13px 0 rgba(0,0,0,.25)', transform: `scale(${sp(3)})` }}>
        T'AS EU
        <br />
        <span style={{ color: palette.acc }}>COMBIEN ?</span>
      </div>
      <div style={{ position: 'absolute', top: 905, left: 90, right: 90, display: 'grid', gap: 22 }}>
        {rows.map((t, i) => {
          const s = sp(beatFrames * (2 + i));
          return (
            <div key={i} style={{ transform: `translateX(${(1 - s) * -60}px) scale(${0.6 + 0.4 * s})`, opacity: Math.min(1, s * 2), background: 'rgba(0,0,0,.24)', borderRadius: 40, padding: '20px 34px', font: `700 50px ${TEXT_FONT}`, color: '#fff' }}>
              <EmojiText text={t} />
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', top: 1265, width: '100%', textAlign: 'center', transform: `scale(${sp(beatFrames * 5)})` }}>
        <div style={{ font: `64px/1.1 ${TITLE_FONT}`, color: '#fff', textShadow: '0 8px 0 rgba(0,0,0,.2)' }}>
          <EmojiText text="Dis ton score en commentaire 👇" />
        </div>
        <div style={{ font: `700 46px ${TEXT_FONT}`, color: '#fff', opacity: 0.9, marginTop: 22 }}>
          <EmojiText text={next} />
        </div>
      </div>
      <div style={{ position: 'absolute', top: 1450, width: '100%', textAlign: 'center', font: `500 24px ${TEXT_FONT}`, color: '#fff', opacity: 0.55 }}>Emojis : Microsoft Fluent (MIT) · Twemoji (CC BY 4.0)</div>
      <Sfx at={0} name="whoosh" volume={0.55} />
      <Sfx at={wipe} name="applaudissements" volume={0.5} />
      <Sfx at={wipe} name="ding" volume={0.6} />
    </Wipe>
  );
};
