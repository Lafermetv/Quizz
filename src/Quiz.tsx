import React from 'react';
import { AbsoluteFill, Audio, type CalculateMetadataFunction, interpolate, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Intro } from './components/Intro';
import { Outro } from './components/Outro';
import { Round } from './components/Round';
import './lib/fonts';
import { loadAnswerImages } from './lib/images';
import type { QuizProps } from './lib/packs';
import { makePlan } from './lib/plan';
import { paletteFor } from './lib/theme';

export const Quiz: React.FC<QuizProps> = ({ packName, theme, thinkSeconds, films, part, totalParts, music = true, devine, pluriel, bareme, images }) => {
  const { fps } = useVideoConfig();
  const plan = makePlan(films.map((f) => f.emojis.length), thinkSeconds, fps);
  const think = Math.round((plan.rounds[0].thinkEnd - plan.rounds[0].thinkStart) / fps);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Sequence from={0} durationInFrames={plan.intro.end} name="Intro">
        <Intro palette={paletteFor(theme, 0)} packName={packName} part={part} count={films.length} think={think} beatFrames={plan.beatFrames} devine={devine} pluriel={pluriel} />
      </Sequence>
      {films.map((film, i) => {
        const r = plan.rounds[i];
        return (
          <Sequence key={i} from={r.from} durationInFrames={r.end - r.from} name={`Film ${i + 1} · ${film.title}`}>
            <Round film={film} index={i} total={films.length} plan={r} palette={paletteFor(theme, i)} beatFrames={plan.beatFrames} wipe={plan.wipe} devine={devine} image={images?.[i] ?? null} />
          </Sequence>
        );
      })}
      <Sequence from={plan.outro.from} durationInFrames={plan.outro.end - plan.outro.from} name="Fin">
        <Outro palette={paletteFor(theme, 2)} count={films.length} part={part} totalParts={totalParts} beatFrames={plan.beatFrames} wipe={plan.wipe} bareme={bareme} />
      </Sequence>
      {music && (
        <Audio
          src={staticFile('musique/boucle-120bpm.wav')}
          loop
          volume={(f) => 0.32 * interpolate(f, [plan.total - fps * 1.2, plan.total], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
        />
      )}
    </AbsoluteFill>
  );
};

/** Calcule la durée et va chercher les images des réponses avant le rendu. */
export const quizMetadata: CalculateMetadataFunction<QuizProps> = async ({ props }) => {
  const fps = props.fps ?? 30;
  const plan = makePlan(props.films.map((f) => f.emojis.length), props.thinkSeconds, fps);
  const images = await loadAnswerImages(props);
  return { durationInFrames: plan.total, fps, props: { ...props, images } };
};
