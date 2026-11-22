import { getStaticFiles, staticFile } from 'remotion';
import type { Film } from './packs';

/** « Là-haut » → « la-haut » : le nom de fichier attendu pour l'affiche. */
export const slugify = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' et ')
    .replace(/œ/g, 'oe')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const EXT = /\.(jpe?g|png|webp|avif)$/i;

/** Cherche l'affiche du film dans public/affiches/ (ex. affiches/le-roi-lion.jpg). */
export const posterFor = (film: Film): string | null => {
  const wanted = `affiches/${slugify(film.title)}`;
  const file = getStaticFiles().find((f) => EXT.test(f.name) && f.name.replace(EXT, '') === wanted);
  return file ? staticFile(file.name) : null;
};
