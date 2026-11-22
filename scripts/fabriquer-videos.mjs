/**
 * Fabrique les vidéos MP4 (1080×1920) + les images de couverture, une par pack.
 *
 *   npm run videos                      → toutes les vidéos de tous les packs
 *   npm run videos -- disney-pixar      → seulement ce pack
 *   npm run videos -- --fps 60          → en 60 images/seconde (plus fluide, plus long à fabriquer)
 *   npm run couvertures                 → seulement les images de couverture
 *
 * Les fichiers sortent dans le dossier out/.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { bundle } from '@remotion/bundler';
import { getCompositions, renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import { verifierPacks } from './verifier-packs.mjs';

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const value = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const wanted = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && ['--fps', '--concurrence'].includes(args[i - 1])));
const fps = Number(value('--fps') || 30);
const coversOnly = flag('--couvertures');
const noCovers = flag('--sans-couverture');
const concurrency = value('--concurrence') ? Number(value('--concurrence')) : null; // null = réglage automatique

// Navigateur utilisé pour le rendu : Remotion télécharge le sien automatiquement si besoin.
const browserExecutable = process.env.QUIZ_NAVIGATEUR || (fs.existsSync('/opt/pw-browsers/chromium_headless_shell') ? '/opt/pw-browsers/chromium_headless_shell' : null);

console.log('\n🔎 Vérification des packs…');
if (verifierPacks()) {
  console.log('\nCorrige les erreurs ci-dessus puis relance.');
  process.exit(1);
}

console.log('\n📦 Préparation du projet…');
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const all = await getCompositions(serveUrl, { browserExecutable });
let videos = all.filter((c) => !c.id.endsWith('-couverture'));
if (wanted.length) videos = videos.filter((c) => wanted.some((w) => c.id === w || c.id.startsWith(`${w}-partie-`)));
if (!videos.length) {
  console.log(`Aucune vidéo trouvée pour : ${wanted.join(', ')}.\nVidéos disponibles : ${all.filter((c) => !c.id.endsWith('-couverture')).map((c) => c.id).join(', ')}`);
  process.exit(1);
}

fs.mkdirSync('out', { recursive: true });
for (const comp of videos) {
  const props = { ...comp.defaultProps, fps };
  if (!noCovers) {
    const cover = all.find((c) => c.id === `${comp.id}-couverture`);
    const file = path.join('out', `${comp.id}-couverture.png`);
    await renderStill({ composition: cover, serveUrl, output: file, inputProps: props, browserExecutable, imageFormat: 'png' });
    console.log(`🖼️  ${file}`);
  }
  if (coversOnly) continue;
  const file = path.join('out', `${comp.id}.mp4`);
  const tmp = path.join('out', `.${comp.id}.brut.mp4`);
  const t0 = Date.now();
  let last = -1;
  const composition = await selectComposition({ serveUrl, id: comp.id, inputProps: props, browserExecutable });
  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    crf: 18,
    audioCodec: 'aac',
    audioBitrate: '192k',
    outputLocation: tmp,
    inputProps: props,
    browserExecutable,
    imageFormat: 'jpeg',
    jpegQuality: 95,
    concurrency,
    onProgress: ({ progress }) => {
      const p = Math.floor(progress * 100);
      if (p !== last && p % 5 === 0) { last = p; process.stdout.write(`\r🎬 ${comp.id} : ${p} %   `); }
    },
  });
  // Volume réglé au niveau standard des réseaux sociaux (-14 LUFS), sans retoucher l'image.
  const ff = spawnSync('npx', ['remotion', 'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', tmp, '-c:v', 'copy', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', file], { stdio: 'inherit' });
  if (ff.status === 0) fs.rmSync(tmp);
  else fs.renameSync(tmp, file);
  const dur = (composition.durationInFrames / fps).toFixed(1);
  console.log(`\r✅ ${file}  (${dur} s de vidéo, fabriquée en ${Math.round((Date.now() - t0) / 1000)} s)`);
}
console.log('\nTerminé ! Les fichiers sont dans le dossier out/.');
