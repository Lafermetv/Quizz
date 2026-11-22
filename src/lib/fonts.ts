import { loadFont } from '@remotion/fonts';
import lilita from '@fontsource/lilita-one/files/lilita-one-latin-400-normal.woff2';
import fredoka500 from '@fontsource/fredoka/files/fredoka-latin-500-normal.woff2';
import fredoka600 from '@fontsource/fredoka/files/fredoka-latin-600-normal.woff2';
import fredoka700 from '@fontsource/fredoka/files/fredoka-latin-700-normal.woff2';

// Polices embarquées dans le projet : pas besoin d'internet pour le rendu.
loadFont({ family: 'Lilita One', url: lilita, weight: '400' });
loadFont({ family: 'Fredoka', url: fredoka500, weight: '500' });
loadFont({ family: 'Fredoka', url: fredoka600, weight: '600' });
loadFont({ family: 'Fredoka', url: fredoka700, weight: '700' });

export const TITLE_FONT = '"Lilita One", sans-serif';
export const TEXT_FONT = 'Fredoka, sans-serif';
