// Palettes : [fond, anneaux, accent]. Une couleur différente à chaque manche.
export type Palette = { c1: string; c2: string; acc: string; name: string };

const P = (name: string, c1: string, c2: string, acc: string): Palette => ({ name, c1, c2, acc });

export const PALETTES: Palette[] = [
  P('bleu', '#2f6bff', '#2459e6', '#c6ff3d'),
  P('orange', '#ff9a2e', '#ff860f', '#2f4bff'),
  P('violet', '#7b3cff', '#6a2bef', '#ffe03d'),
  P('rose', '#ff4f9a', '#f33b88', '#fff23d'),
  P('turquoise', '#14b8a6', '#0da393', '#ffe03d'),
  P('rouge', '#ff5a4f', '#f2453a', '#fff23d'),
];

/** Palette de la manche i, en commençant par la couleur du thème du pack. */
export const paletteFor = (theme: string | undefined, i: number): Palette => {
  const start = Math.max(0, PALETTES.findIndex((p) => p.name === theme));
  return PALETTES[(start + i) % PALETTES.length];
};

/** Couleur de texte lisible posée sur une couleur de fond donnée. */
export const inkOn = (hex: string): string => {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#13202b' : '#ffffff';
};
