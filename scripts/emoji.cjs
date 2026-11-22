#!/usr/bin/env node
/*
 * Outil emojis pour le quiz « Devine avec des emojis » (rendu Microsoft Fluent 3D, comme dans la vidéo).
 *
 *   npm run emoji -- check "🐗🧪🐫"
 *       → pour chaque emoji : disponible en 3D ? + nom officiel français + mots-clés
 *   npm run emoji -- search potion pyramide "voyage dans le temps"
 *       → emojis dont le nom ou les mots-clés (français ou anglais) contiennent ces mots
 *   npm run emoji -- board /chemin/sortie.png "Titre" "🐗🧪🐫" "⚡👓🧙‍♂️" ...
 *       → image PNG des indices numérotés (1, 2, 3…) avec le vrai rendu 3D ; ouvre-la ensuite avec Read
 *   npm run emoji -- board --noms /chemin/sortie.png "Titre" ...
 *       → pareil, avec le nom de chaque emoji écrit dessous (pour vérifier ce qu'on voit)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FLUENT = path.join(ROOT, 'node_modules/@lobehub/fluent-emoji-3d/assets');
const TWEMOJI = path.join(ROOT, 'node_modules/@twemoji/svg');
const DATA = path.join(ROOT, 'node_modules/emojibase-data');

const fluentFiles = new Set(fs.readdirSync(FLUENT));
const seg = new Intl.Segmenter('fr', { granularity: 'grapheme' });
const graphemes = (s) => [...seg.segment(s)].map((x) => x.segment).filter((x) => x.trim());
const hex = (s) => [...s].map((c) => c.codePointAt(0).toString(16)).join('-');
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const strip = (e) => e.replace(/️/g, '');

function fluentFile(e) {
  const bare = strip(e);
  const first = [...bare].map((c, i, a) => (i === 0 && a.length > 1 ? c + '️' : c)).join('');
  for (const t of [hex(e), hex(bare), `${hex(bare)}-fe0f`, hex(first)]) if (fluentFiles.has(`${t}.webp`)) return path.join(FLUENT, `${t}.webp`);
  return null;
}
function twemojiFile(e) {
  const t = e.includes('‍') ? hex(e) : hex(strip(e));
  const f = path.join(TWEMOJI, `${t}.svg`);
  return fs.existsSync(f) ? f : null;
}

// noms officiels (CLDR) en français et en anglais, y compris les variantes de couleur de peau
const names = new Map();
function addData(lang) {
  const data = JSON.parse(fs.readFileSync(path.join(DATA, lang, 'data.json'), 'utf8'));
  const put = (x) => {
    const k = strip(x.emoji);
    const cur = names.get(k) || { emoji: x.emoji, fr: '', frTags: [], en: '', enTags: [], skin: !!x.tone };
    if (lang === 'fr') { cur.fr = x.label; cur.frTags = x.tags || []; } else { cur.en = x.label; cur.enTags = x.tags || []; }
    names.set(k, cur);
  };
  for (const x of data) { put(x); for (const s of x.skins || []) put({ ...s, tone: true }); }
}
addData('fr');
addData('en');

const info = (e) => names.get(strip(e)) || null;

function cmdCheck(args) {
  const list = graphemes(args.join(''));
  for (const e of list) {
    const n = info(e);
    const f = fluentFile(e);
    const status = f ? '3D ✓' : twemojiFile(e) ? '✗ pas en 3D (version plate seulement) — à éviter' : '✗ N’EXISTE PAS — interdit';
    console.log(`${e}  ${status}  « ${n ? n.fr || n.en : 'inconnu'} »${n && n.frTags.length ? `  [${n.frTags.slice(0, 8).join(', ')}]` : ''}`);
  }
}

function cmdSearch(args) {
  for (const q of args) {
    const STOP = new Set(['le', 'la', 'les', 'l', 'de', 'du', 'des', 'd', 'dans', 'en', 'un', 'une', 'et', 'a', 'au', 'aux', 'pour', 'par', 'sur', 'avec', 'the', 'of', 'in', 'an', 'and', 'to']);
    const words = norm(q).split(/[\s'’]+/).filter((w) => w.length > 1 && !STOP.has(w));
    const scored = [];
    const toks = (t) => norm(t).split(/[^a-z0-9]+/).filter(Boolean);
    for (const n of names.values()) {
      if (n.skin) continue;
      const label = toks(`${n.fr} ${n.en}`);
      const tags = toks(`${n.frTags.join(' ')} ${n.enTags.join(' ')}`);
      let score = 0;
      for (const w of words) {
        if (label.includes(w)) score += 3;
        else if (w.length >= 4 && label.some((t) => t.startsWith(w))) score += 2;
        else if (tags.includes(w)) score += 1.5;
        else if (w.length >= 4 && tags.some((t) => t.startsWith(w))) score += 1;
      }
      if (score > 0 && fluentFile(n.emoji)) scored.push({ n, score });
    }
    scored.sort((a, b) => b.score - a.score);
    console.log(`« ${q} » : ${scored.length ? '' : 'aucun emoji 3D trouvé'}`);
    for (const { n } of scored.slice(0, 25)) console.log(`  ${n.emoji}  ${n.fr || n.en}${n.en && n.fr ? `  (${n.en})` : ''}`);
  }
}

async function cmdBoard(args) {
  const showNames = args[0] === '--noms';
  if (showNames) args = args.slice(1);
  const [out, title, ...clues] = args;
  if (!out || !clues.length) throw new Error('usage : board [--noms] sortie.png "Titre" "🐗🧪🐫" ...');
  const sticker = 'drop-shadow(4px 0 0 #fff) drop-shadow(-4px 0 0 #fff) drop-shadow(0 4px 0 #fff) drop-shadow(0 -4px 0 #fff) drop-shadow(0 8px 6px rgba(0,0,0,.28))';
  const cards = clues.map((c, i) => {
    const items = graphemes(c).map((e) => {
      const f = fluentFile(e);
      const tw = !f && twemojiFile(e);
      const img = f || tw ? `<img src="file://${f || tw}" style="width:88px;height:88px;filter:${sticker}">` : `<div class="miss">${e}</div>`;
      const n = info(e);
      return `<div class="e">${img}${showNames ? `<div class="nm">${n ? n.fr || n.en : '?'}</div>` : ''}</div>`;
    });
    return `<div class="card"><div class="num">${i + 1}</div><div class="row">${items.join('')}</div></div>`;
  });
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;padding:26px;width:948px;font-family:system-ui,sans-serif;color:#fff;
      background:repeating-radial-gradient(circle at 50% 30%,#2f6bff 0 40px,#2459e6 40px 80px)}
    h1{margin:0 0 18px;font:800 34px system-ui;text-shadow:0 3px 0 rgba(0,0,0,.25)}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .card{position:relative;background:rgba(0,0,0,.18);border-radius:22px;padding:22px 14px 18px 64px;min-height:150px;display:flex;align-items:center}
    .num{position:absolute;left:14px;top:14px;width:40px;height:40px;border-radius:50%;background:#fff;color:#2459e6;font:800 24px/40px system-ui;text-align:center}
    .row{display:flex;gap:8px;align-items:flex-start;flex-wrap:nowrap}
    .e{display:flex;flex-direction:column;align-items:center;width:92px}
    .nm{font:600 13px/1.15 system-ui;text-align:center;margin-top:6px;max-width:92px}
    .miss{width:88px;height:88px;font-size:70px;outline:4px solid red}
  </style><h1>${title || ''}</h1><div class="grid">${cards.join('')}</div>`;
  const tmp = `${out}.html`;
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(tmp, html);
  const { chromium } = require('playwright');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 800 }, deviceScaleFactor: 1 });
  await p.goto(`file://${path.resolve(tmp)}`);
  await p.waitForLoadState('networkidle');
  await p.screenshot({ path: out, fullPage: true });
  await b.close();
  fs.rmSync(tmp);
  console.log(`Image : ${path.resolve(out)} (ouvre-la avec Read)`);
}

const [cmd, ...rest] = process.argv.slice(2);
(async () => {
  if (cmd === 'check') cmdCheck(rest);
  else if (cmd === 'search') cmdSearch(rest);
  else if (cmd === 'board') await cmdBoard(rest);
  else console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0]);
})().catch((e) => { console.error('Erreur :', e.message); process.exit(1); });
