/**
 * Vérifie les fichiers du dossier packs/ : format, emojis disponibles, longueur des titres.
 * Lancer : npm run verifier
 */
import fs from 'node:fs';
import path from 'node:path';

const seg = new Intl.Segmenter('fr', { granularity: 'grapheme' });
const split = (s) => [...seg.segment(s)].map((x) => x.segment).filter((x) => x.trim());
const code = (e) => [...(e.includes('‍') ? e : e.replace(/️/g, ''))].map((c) => c.codePointAt(0).toString(16)).join('-');
const svgDir = path.resolve('node_modules/@twemoji/svg');

export function verifierPacks({ quiet = false } = {}) {
  const dir = path.resolve('packs');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  let errors = 0;
  const log = (...a) => !quiet && console.log(...a);
  for (const file of files) {
    let pack;
    try {
      pack = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    } catch (e) {
      console.log(`✗ ${file} : le fichier JSON est mal écrit (${e.message})`);
      errors++;
      continue;
    }
    const problems = [];
    if (!pack.pack) problems.push('il manque "pack" (le nom affiché)');
    if (!Array.isArray(pack.films) || pack.films.length === 0) problems.push('il manque la liste "films"');
    (pack.films || []).forEach((f, i) => {
      const where = `film ${i + 1}${f.title ? ` (${f.title})` : ''}`;
      if (!f.title) problems.push(`${where} : il manque "title"`);
      const emojis = (Array.isArray(f.emojis) ? f.emojis : [f.emojis || '']).flatMap(split);
      if (emojis.length < 1 || emojis.length > 4) problems.push(`${where} : il faut entre 1 et 4 emojis (il y en a ${emojis.length})`);
      for (const e of emojis) if (!fs.existsSync(path.join(svgDir, `${code(e)}.svg`))) problems.push(`${where} : l'emoji ${e} n'existe pas dans Twemoji`);
      if (f.title && f.title.length > 40) problems.push(`${where} : titre très long (${f.title.length} caractères), il sera petit à l'écran`);
    });
    if (problems.length) {
      console.log(`✗ ${file}`);
      problems.forEach((p) => console.log(`   - ${p}`));
      errors++;
    } else log(`✓ ${file} : ${pack.films.length} films`);
  }
  return errors;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(verifierPacks() ? 1 : 0);
}
