import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Background } from './components/Background';
import { Emoji, EmojiText } from './components/Emoji';
import { TEXT_FONT, TITLE_FONT } from './lib/fonts';
import type { QuizProps } from './lib/packs';
import { inkOn, paletteFor } from './lib/theme';
import { DevineWord, fitFont } from './components/DevineTitle';

/**
 * Image de couverture TikTok (1080×1920).
 * Tout l'important reste dans la zone centrale, visible aussi dans la grille du profil (recadrage 3:4).
 */
export const Cover: React.FC<QuizProps> = ({ packName, theme, films, part, cover, devine, pluriel }) => {
  const palette = paletteFor(theme, 0);
  const emojis = (cover && cover.length ? cover : films[0]?.emojis ?? ['🎬', '🍿', '🤔']).slice(0, 3);
  const tilt = [-9, 5, -4];
  return (
    <AbsoluteFill>
      <Background palette={palette} beatFrames={1e9} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 40, paddingBottom: 60 }}>
        <div style={{ font: `72px ${TITLE_FONT}`, background: palette.acc, color: inkOn(palette.acc), padding: '20px 54px 12px', borderRadius: 80, boxShadow: '0 12px 0 rgba(0,0,0,.22)', transform: 'rotate(-3deg)' }}>
          {packName.toUpperCase()}
        </div>
        <div style={{ font: `${fitFont(devine, 215)}px/0.92 ${TITLE_FONT}`, color: '#fff', textAlign: 'center', textShadow: '0 16px 0 rgba(0,0,0,.25)' }}>
          DEVINE
          <br />
          <DevineWord devine={devine} acc={palette.acc} />
        </div>
        <div style={{ display: 'flex', gap: 44, margin: '20px 0' }}>
          {emojis.map((e, i) => (
            <div key={i} style={{ transform: `rotate(${tilt[i]}deg) translateY(${i === 1 ? -24 : 0}px)` }}>
              <Emoji emoji={e} size={250} />
            </div>
          ))}
        </div>
        <div style={{ font: `700 66px ${TEXT_FONT}`, color: '#fff' }}>avec seulement des emojis</div>
        <div style={{ font: `76px ${TITLE_FONT}`, background: '#fff', color: palette.c2, padding: '22px 50px 14px', borderRadius: 50, boxShadow: '0 14px 0 rgba(0,0,0,.2)' }}>
          <EmojiText text={part ? `PARTIE ${part} · ${films.length} ${pluriel.toUpperCase()} 🔥` : `${films.length} ${pluriel.toUpperCase()} · T'AS TOUT ? 🔥`} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
