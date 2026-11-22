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
const fluent = new Set(fs.existsSync('node_modules/@lobehub/fluent-emoji-3d/assets') ? fs.readdirSync('node_modules/@lobehub/fluent-emoji-3d/assets') : []);
const hex = (s) => [...s].map((c) => c.codePointAt(0).toString(16)).join('-');
const hasFluent = (e) => {
  const bare = e.replace(/\uFE0F/g, '');
  const first = [...bare].map((c, i, a) => (i === 0 && a.length > 1 ? c + '\uFE0F' : c)).join('');
  return [hex(e), hex(bare), `${hex(bare)}-fe0f`, hex(first)].some((t) => fluent.has(`${t}.webp`));
};

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
    const items = pack.films ?? pack.questions;
    if (!pack.pack) problems.push('il manque "pack" (le nom affiché)');
    if (!Array.isArray(items) || items.length === 0) problems.push('il manque la liste "films" (ou "questions")');
    if (pack.bareme && (!Array.isArray(pack.bareme) || pack.bareme.length !== 3)) problems.push('"bareme" doit contenir exactement 3 phrases');
    (items || []).forEach((f, i) => {
      const where = `film ${i + 1}${f.title ? ` (${f.title})` : ''}`;
      if (!f.title) problems.push(`${where} : il manque "title"`);
      const emojis = (Array.isArray(f.emojis) ? f.emojis : [f.emojis || '']).flatMap(split);
      if (emojis.length < 1 || emojis.length > 4) problems.push(`${where} : il faut entre 1 et 4 emojis (il y en a ${emojis.length})`);
      for (const e of emojis) if (!hasFluent(e) && !fs.existsSync(path.join(svgDir, `${code(e)}.svg`))) problems.push(`${where} : l'emoji ${e} n'existe pas (ni en 3D ni en Twemoji)`);
      if (f.title && f.title.length > 40) problems.push(`${where} : titre très long (${f.title.length} caractères), il sera petit à l'écran`);
    });
    if (problems.length) {
      console.log(`✗ ${file}`);
      problems.forEach((p) => console.log(`   - ${p}`));
      errors++;
    } else log(`✓ ${file} : ${items.length} ${pack.pluriel ?? 'films'}`);
  }
  return errors;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(verifierPacks() ? 1 : 0);
}
