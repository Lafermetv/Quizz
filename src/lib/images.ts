import { getStaticFiles, staticFile } from 'remotion';
import type { AnswerImage, QuizProps } from './packs';

/** « Là-haut » → « la-haut » : le nom de fichier attendu pour l'image de la réponse. */
export const slugify = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' et ')
    .replace(/œ/g, 'oe')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const EXT = /\.(jpe?g|png|webp|avif|gif)$/i;

const size = (src: string) =>
  new Promise<{ w: number; h: number }>((resolve) => {
    const im = new Image();
    im.onload = () => resolve({ w: im.naturalWidth || 2, h: im.naturalHeight || 3 });
    im.onerror = () => resolve({ w: 2, h: 3 });
    im.src = src;
  });

/**
 * Trouve l'image de chaque réponse dans public/<dossier>/ (ex. affiches/le-roi-lion.jpg),
 * lit sa taille réelle et son crédit éventuel (public/<dossier>/credits.json).
 */
export const loadAnswerImages = async (props: QuizProps): Promise<AnswerImage[]> => {
  const files = getStaticFiles();
  const folder = props.imageFolder || 'affiches';
  let credits: Record<string, string> = {};
  const creditFile = files.find((f) => f.name === `${folder}/credits.json`);
  if (creditFile) {
    credits = await fetch(staticFile(creditFile.name))
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => ({}));
  }
  return Promise.all(
    props.films.map(async (film) => {
      const slug = slugify(film.title);
      const file = files.find((f) => EXT.test(f.name) && f.name.replace(EXT, '') === `${folder}/${slug}`);
      if (!file) return null;
      const src = staticFile(file.name);
      return { src, ...(await size(src)), credit: credits[slug] };
    }),
  );
};
