/**
 * Télécharge l'image de chaque réponse (affiche, photo, logo, drapeau…) dans public/<dossier>/<nom>.jpg
 *
 *   npm run images                    → tous les packs
 *   npm run images -- footballeurs    → un seul pack
 *
 * Où il cherche, dans l'ordre :
 *   1. "image": "https://…" dans la question (adresse d'une image trouvée sur internet) ;
 *   2. "wiki": "en:Lionel_Messi" dans la question (une page Wikipédia précise) ;
 *   3. TMDB pour les films et séries, si une clé est dans tmdb.txt (affiches françaises, nettes) ;
 *   4. Wikipédia : recherche « <réponse> <recherche> » (ex. « Lionel Messi footballeur »).
 *
 * Les images sous licence libre (Wikimedia Commons) ont leur crédit noté dans credits.json :
 * il s'affiche tout seul, en petit, à côté de l'image dans la vidéo.
 * Une image déjà présente n'est jamais remplacée : tu peux aussi en déposer une toi-même avec le bon nom.
 */
import fs from 'node:fs';
import path from 'node:path';

const UA = 'QuizEmojiFilms/0.1 (projet personnel)';
const KEY = process.env.TMDB_API_KEY || (fs.existsSync('tmdb.txt') ? fs.readFileSync('tmdb.txt', 'utf8').trim() : '');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/&/g, ' et ').replace(/œ/g, 'oe').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const stripTags = (s = '') => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();

async function get(url, json = true) {
  for (let i = 0; i < 6; i++) {
    const r = await fetch(url, { headers: { 'User-Agent': UA } }).catch(() => null);
    if (r && r.ok) {
      const body = json ? await r.json().catch(() => null) : Buffer.from(await r.arrayBuffer());
      if (body) return body;
    }
    if (r && r.status === 404) return null;
    const retry = Number(r?.headers.get('retry-after')) || 0;
    await wait(Math.max(retry * 1000, 3000 * (i + 1)));
  }
  return null;
}

const summary = async (lang, title) => {
  const s = await get(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`);
  const img = s?.originalimage || s?.thumbnail;
  return img ? { url: img.source.split('?')[0], ratio: img.width / img.height } : null;
};

async function viaTmdb(item, tv) {
  const q = encodeURIComponent(item.title);
  for (const kind of tv ? ['tv', 'movie'] : ['movie', 'tv']) {
    const y = item.year ? (kind === 'tv' ? `&first_air_date_year=${item.year}` : `&year=${item.year}`) : '';
    const d = await get(`https://api.themoviedb.org/3/search/${kind}?api_key=${KEY}&language=fr-FR&query=${q}${y}`);
    const hit = d?.results?.find((x) => x.poster_path);
    if (hit) return { url: `https://image.tmdb.org/t/p/w780${hit.poster_path}`, ratio: 2 / 3 };
  }
  return null;
}

async function viaWikipedia(item, hint) {
  const q = encodeURIComponent(`${item.title} ${hint} ${item.year ?? ''}`.trim());
  const s = await get(`https://fr.wikipedia.org/w/rest.php/v1/search/page?q=${q}&limit=1`);
  const key = s?.pages?.[0]?.key;
  if (!key) return null;
  // la page anglaise a souvent l'affiche ou le logo officiel ; la page française a surtout des photos libres
  const l = await get(`https://fr.wikipedia.org/w/api.php?action=query&format=json&prop=langlinks&lllang=en&titles=${encodeURIComponent(key)}`);
  const en = l && Object.values(l.query?.pages ?? {})[0]?.langlinks?.[0]?.['*'];
  return (en && (await summary('en', en))) || (await summary('fr', key));
}

/** Crédit à afficher si l'image est sous licence libre (Wikimedia Commons). */
async function creditFor(url) {
  const m = url.match(/upload\.wikimedia\.org\/wikipedia\/commons\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/]+)/);
  if (!m) return null;
  const d = await get(`https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=extmetadata&titles=File:${m[1]}`);
  const meta = d && Object.values(d.query?.pages ?? {})[0]?.imageinfo?.[0]?.extmetadata;
  const lic = meta?.LicenseShortName?.value ?? '';
  const artist = stripTags(meta?.Artist?.value).slice(0, 60);
  if (!/CC|GFDL|Attribution/i.test(lic) || !artist) return null;
  return `Photo : ${artist} · ${lic} · Wikimedia Commons`;
}

const only = process.argv.slice(2);
let missing = [];
console.log(KEY ? 'Sources : TMDB (films, séries) + Wikipédia' : 'Source : Wikipédia (ajoute une clé TMDB dans tmdb.txt pour des affiches de films plus nettes)');
for (const file of fs.readdirSync('packs').filter((f) => f.endsWith('.json')).sort()) {
  if (only.length && !only.includes(file.replace('.json', ''))) continue;
  const pack = JSON.parse(fs.readFileSync(path.join('packs', file), 'utf8'));
  const folder = path.resolve('public', pack.dossierImages ?? 'affiches');
  fs.mkdirSync(folder, { recursive: true });
  const creditsFile = path.join(folder, 'credits.json');
  const credits = fs.existsSync(creditsFile) ? JSON.parse(fs.readFileSync(creditsFile, 'utf8')) : {};
  const devine = pack.devine ?? 'le film';
  const tv = /s[ée]rie|dessin/i.test(devine) || /s[ée]rie/i.test(pack.pack);
  const isScreen = /film|s[ée]rie|dessin/i.test(devine);
  const hint = pack.recherche ?? (tv ? 'série télévisée' : isScreen ? 'film' : '');
  console.log(`\n${pack.pack} → public/${pack.dossierImages ?? 'affiches'}/`);
  for (const item of pack.films ?? pack.questions ?? []) {
    const name = slug(item.title);
    if (fs.readdirSync(folder).some((f) => f.replace(/\.\w+$/, '') === name && !f.endsWith('.json'))) continue;
    let found = item.image ? { url: item.image } : null;
    if (!found && item.wiki) {
      const [lang, title] = /^(en|fr):/.test(item.wiki) ? [item.wiki.slice(0, 2), item.wiki.slice(3)] : ['fr', item.wiki];
      found = await summary(lang, title);
    }
    if (!found && KEY && isScreen) found = await viaTmdb(item, tv);
    if (!found) found = await viaWikipedia(item, hint);
    const img = found && (await get(found.url, false));
    const kind = img && (img[0] === 0xff ? 'jpg' : img[0] === 0x89 ? 'png' : img.slice(8, 12).toString() === 'WEBP' ? 'webp' : null);
    if (!kind) {
      missing.push(`${item.title}  →  public/${pack.dossierImages ?? 'affiches'}/${name}.jpg`);
      console.log(`  ✗ ${item.title} : pas trouvée`);
      continue;
    }
    fs.writeFileSync(path.join(folder, `${name}.${kind}`), img);
    const credit = await creditFor(found.url);
    if (credit) credits[name] = credit;
    console.log(`  ✓ ${item.title}${credit ? `  (${credit})` : ''}`);
    await wait(800);
  }
  if (Object.keys(credits).length) fs.writeFileSync(creditsFile, JSON.stringify(credits, null, 2));
}
if (missing.length) console.log(`\nÀ déposer à la main (glisse l'image avec ce nom exact) :\n  ${missing.join('\n  ')}`);
console.log('\nPense à regarder les images : si une ne va pas, supprime-la et mets la bonne avec le même nom.');
