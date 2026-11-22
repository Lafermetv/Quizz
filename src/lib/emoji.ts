// Emojis Twemoji (SVG, licence CC BY 4.0) : rendu identique partout, net même en très gros.
const svgs = require.context('@twemoji/svg', false, /\.svg$/);
const available = new Set(svgs.keys());

const segmenter = new Intl.Segmenter('fr', { granularity: 'grapheme' });

/** Découpe une chaîne en caractères visibles ("🧙‍♂️💍" → ["🧙‍♂️", "💍"]). */
export const splitGraphemes = (s: string): string[] => [...segmenter.segment(s)].map((x) => x.segment);

/** Nom de fichier Twemoji d'un emoji (même règle que la librairie officielle). */
export const emojiCode = (emoji: string): string => {
  const s = emoji.includes('‍') ? emoji : emoji.replace(/️/g, '');
  return [...s].map((c) => c.codePointAt(0)!.toString(16)).join('-');
};

export const isEmoji = (g: string): boolean => /\p{Extended_Pictographic}|\p{Regional_Indicator}|⃣/u.test(g);

export const emojiSrc = (emoji: string): string | null => {
  const key = `./${emojiCode(emoji)}.svg`;
  if (!available.has(key)) return null;
  const mod = svgs(key) as string | { default: string };
  return typeof mod === 'string' ? mod : mod.default;
};
