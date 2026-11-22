// Emojis 3D « Fluent » de Microsoft (licence MIT) : le style le plus beau et brillant.
// Si un emoji n'existe pas en 3D, on prend la version Twemoji (SVG, licence CC BY 4.0).
const fluent = require.context('@lobehub/fluent-emoji-3d/assets', false, /\.webp$/);
const fluentKeys = new Set(fluent.keys());
const svgs = require.context('@twemoji/svg', false, /\.svg$/);
const available = new Set(svgs.keys());
const url = (mod: unknown) => (typeof mod === 'string' ? mod : (mod as { default: string }).default);

const segmenter = new Intl.Segmenter('fr', { granularity: 'grapheme' });

/** Découpe une chaîne en caractères visibles ("🧙‍♂️💍" → ["🧙‍♂️", "💍"]). */
export const splitGraphemes = (s: string): string[] => [...segmenter.segment(s)].map((x) => x.segment);

/** Nom de fichier Twemoji d'un emoji (même règle que la librairie officielle). */
export const emojiCode = (emoji: string): string => {
  const s = emoji.includes('‍') ? emoji : emoji.replace(/️/g, '');
  return [...s].map((c) => c.codePointAt(0)!.toString(16)).join('-');
};

export const isEmoji = (g: string): boolean => /\p{Extended_Pictographic}|\p{Regional_Indicator}|⃣/u.test(g);

const hex = (s: string) => [...s].map((c) => c.codePointAt(0)!.toString(16)).join('-');

/** Code Fluent : séquence complète avec FE0F (ex. 2744-fe0f), avec plusieurs essais. */
const fluentFile = (emoji: string): string | null => {
  const bare = emoji.replace(/\uFE0F/g, '');
  const tries = [hex(emoji), hex(bare), `${hex(bare)}-fe0f`, hex([...bare].map((c, i, a) => (i === 0 && a.length > 1 ? c + '\uFE0F' : c)).join(''))];
  for (const t of tries) if (fluentKeys.has(`./${t}.webp`)) return `./${t}.webp`;
  return null;
};

export const emojiSrc = (emoji: string): string | null => {
  const f = fluentFile(emoji);
  if (f) return url(fluent(f));
  const key = `./${emojiCode(emoji)}.svg`;
  return available.has(key) ? url(svgs(key)) : null;
};
