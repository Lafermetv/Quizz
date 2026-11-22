/**
 * Télécharge l'affiche de chaque film des packs dans public/affiches/<nom-du-film>.jpg
 *   npm run affiches                 → tous les packs
 *   npm run affiches -- disney-pixar → un seul pack
 * Source : TMDB (affiches françaises, nettes) si la clé TMDB_API_KEY est fournie,
 * sinon Wikipédia (anglais, petite taille). Une affiche déjà présente n'est jamais écrasée :
 * tu peux aussi déposer toi-même une image avec le bon nom dans public/affiches/.
 * Dans un film du pack, "poster": "https://…" force l'adresse de l'image.
 */
import fs from 'node:fs';
import path from 'node:path';

const UA = 'QuizEmojiFilms/0.1 (projet personnel)';
const KEY = process.env.TMDB_API_KEY || (fs.existsSync('tmdb.txt') ? fs.readFileSync('tmdb.txt', 'utf8').trim() : '');
const DIR = path.resolve('public/affiches');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/&/g, ' et ').replace(/œ/g, 'oe').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

async function get(url, json = true) {
  for (let i = 0; i < 4; i++) {
    const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: json ? 'application/json' : '*/*' } }).catch(() => null);
    if (r && r.ok) return json ? r.json() : Buffer.from(await r.arrayBuffer());
    await wait(3000 * (i + 1));
  }
  return null;
}

async function viaTmdb(film, tv) {
  const q = encodeURIComponent(film.title);
  for (const kind of tv ? ['tv', 'movie'] : ['movie', 'tv']) {
    const y = film.year ? (kind === 'tv' ? `&first_air_date_year=${film.year}` : `&year=${film.year}`) : '';
    const d = await get(`https://api.themoviedb.org/3/search/${kind}?api_key=${KEY}&language=fr-FR&query=${q}${y}`);
    const hit = d?.results?.find((x) => x.poster_path);
    if (hit) return `https://image.tmdb.org/t/p/w780${hit.poster_path}`;
  }
  return null;
}

async function viaWikipedia(film, tv) {
  const q = encodeURIComponent(`${film.title} ${tv ? 'série télévisée' : 'film'} ${film.year ?? ''}`);
  const s = await get(`https://fr.wikipedia.org/w/rest.php/v1/search/page?q=${q}&limit=1`);
  const key = s?.pages?.[0]?.key;
  if (!key) return null;
  const l = await get(`https://fr.wikipedia.org/w/api.php?action=query&format=json&prop=langlinks&lllang=en&titles=${encodeURIComponent(key)}`);
  const page = l && Object.values(l.query.pages)[0];
  const en = page?.langlinks?.[0]?.['*'];
  for (const [lang, t] of [['en', en], ['fr', key]]) {
    if (!t) continue;
    const sum = await get(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(t.replace(/ /g, '_'))}`);
    if (sum?.originalimage?.source) return sum.originalimage.source;
  }
  return null;
}

const only = process.argv.slice(2);
fs.mkdirSync(DIR, { recursive: true });
const have = fs.readdirSync(DIR);
const missing = [];
console.log(KEY ? 'Source : TMDB (affiches françaises)' : 'Source : Wikipédia (ajoute une clé TMDB pour des affiches plus nettes)');
for (const file of fs.readdirSync('packs').filter((f) => f.endsWith('.json'))) {
  if (only.length && !only.includes(file.replace('.json', ''))) continue;
  const pack = JSON.parse(fs.readFileSync(path.join('packs', file), 'utf8'));
  const tv = /s[ée]rie/i.test(pack.pack) || pack.type === 'series';
  for (const film of pack.films) {
    const name = slug(film.title);
    if (have.some((f) => f.replace(/\.\w+$/, '') === name)) continue;
    const url = film.poster || (KEY ? await viaTmdb(film, tv) : null) || (await viaWikipedia(film, tv));
    const img = url && (await get(url, false));
    if (img && img[0] === 0xff || img && img[0] === 0x89) {
      const ext = img[0] === 0x89 ? 'png' : 'jpg';
      fs.writeFileSync(path.join(DIR, `${name}.${ext}`), img);
      console.log(`✓ ${film.title}`);
    } else {
      missing.push(`${film.title}  →  public/affiches/${name}.jpg`);
      console.log(`✗ ${film.title} : pas trouvée`);
    }
    await wait(800);
  }
}
if (missing.length) console.log(`\nÀ déposer à la main (glisse l'image avec ce nom exact) :\n  ${missing.join('\n  ')}`);
