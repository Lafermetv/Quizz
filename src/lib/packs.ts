import { splitGraphemes } from './emoji';

export type Film = { emojis: string[]; title: string; year?: number; difficulty?: number };

export type QuizProps = {
  /** Nom affiché du pack (ex. « Disney & Pixar ») */
  packName: string;
  theme?: string;
  thinkSeconds: number;
  films: Film[];
  part?: number;
  totalParts?: number;
  cover?: string[];
  fps?: number;
  music?: boolean;
};

type RawFilm = { emojis: string | string[]; title: string; year?: number; difficulty?: number };
type RawPack = {
  pack: string;
  theme?: string;
  thinkSeconds?: number;
  filmsPerVideo?: number;
  cover?: string | string[];
  music?: boolean;
  films: RawFilm[];
};

export type VideoEntry = { id: string; file: string; props: QuizProps };

const toEmojis = (e: string | string[]) =>
  (Array.isArray(e) ? e : splitGraphemes(e)).flatMap((x) => splitGraphemes(x)).filter((x) => x.trim());

/** Transforme un fichier de pack en une ou plusieurs vidéos (10 films par vidéo par défaut). */
export const packToVideos = (file: string, raw: RawPack): VideoEntry[] => {
  const slug = file.replace(/^.*\//, '').replace(/\.json$/, '').replace(/[^a-zA-Z0-9-]/g, '-');
  const films: Film[] = raw.films.map((f) => ({ ...f, emojis: toEmojis(f.emojis) }));
  const per = raw.filmsPerVideo ?? 10;
  const parts = Math.max(1, Math.ceil(films.length / per));
  return Array.from({ length: parts }, (_, k) => ({
    id: parts > 1 ? `${slug}-partie-${k + 1}` : slug,
    file,
    props: {
      packName: raw.pack,
      theme: raw.theme,
      thinkSeconds: raw.thinkSeconds ?? 4,
      films: films.slice(k * per, (k + 1) * per),
      part: parts > 1 ? k + 1 : undefined,
      totalParts: parts > 1 ? parts : undefined,
      cover: raw.cover ? toEmojis(raw.cover) : undefined,
      music: raw.music ?? true,
    },
  }));
};

export const loadVideos = (): VideoEntry[] => {
  const ctx = require.context('../../packs', false, /\.json$/);
  return ctx
    .keys()
    .sort()
    .flatMap((k) => packToVideos(k, ctx(k) as RawPack));
};
