import React from 'react';
import { Img } from 'remotion';
import { emojiSrc, isEmoji, splitGraphemes } from '../lib/emoji';

/** Contour blanc « sticker » + ombre portée. */
export const stickerFilter = (size: number, shadow = true) => {
  const o = Math.max(2, size * 0.034);
  const s = [
    `drop-shadow(${o}px 0 0 #fff)`,
    `drop-shadow(-${o}px 0 0 #fff)`,
    `drop-shadow(0 ${o}px 0 #fff)`,
    `drop-shadow(0 -${o}px 0 #fff)`,
  ];
  if (shadow) s.push(`drop-shadow(0 ${size * 0.07}px ${size * 0.05}px rgba(0,0,0,.28))`);
  return s.join(' ');
};

export const Emoji: React.FC<{
  emoji: string;
  size: number;
  sticker?: boolean;
  style?: React.CSSProperties;
}> = ({ emoji, size, sticker = true, style }) => {
  const src = emojiSrc(emoji);
  const filter = sticker ? stickerFilter(size) : undefined;
  if (!src) {
    return <span style={{ fontSize: size * 0.85, lineHeight: 1, width: size, height: size, display: 'inline-block', textAlign: 'center', filter, ...style }}>{emoji}</span>;
  }
  return <Img src={src} style={{ width: size, height: size, display: 'block', filter, ...style }} />;
};

/** Texte qui mélange lettres et emojis (les emojis deviennent des images Twemoji). */
export const EmojiText: React.FC<{ text: string; style?: React.CSSProperties }> = ({ text, style }) => (
  <span style={style}>
    {splitGraphemes(text).map((g, i) => {
      if (!isEmoji(g)) return g;
      const src = emojiSrc(g);
      if (!src) return g;
      return <Img key={i} src={src} style={{ height: '1.05em', width: '1.05em', verticalAlign: '-0.16em', margin: '0 0.04em' }} />;
    })}
  </span>
);
