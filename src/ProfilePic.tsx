import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Background } from './components/Background';
import { Emoji } from './components/Emoji';
import { TITLE_FONT } from './lib/fonts';
import { PALETTES } from './lib/theme';

/** Photo de profil (1080×1080, lisible même en tout petit rond). */
export const ProfilePic: React.FC<{ emoji: string; theme: number }> = ({ emoji, theme }) => {
  const p = PALETTES[theme % PALETTES.length];
  return (
    <AbsoluteFill>
      <Background palette={p} beatFrames={1e9} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ transform: 'rotate(-6deg)' }}>
          <Emoji emoji={emoji} size={620} />
        </div>
        <div style={{ position: 'absolute', right: 150, top: 120, font: `300px/1 ${TITLE_FONT}`, color: '#fff', textShadow: '0 16px 0 rgba(0,0,0,.25)', transform: 'rotate(14deg)' }}>?</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
