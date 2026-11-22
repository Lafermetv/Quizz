import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';

export type SfxName = 'pop' | 'whoosh' | 'tic' | 'tic-aigu' | 'coeur' | 'ding' | 'tampon' | 'boum' | 'buzzer' | 'applaudissements' | 'swoosh';

/** Joue un bruitage à une image précise (relative à la séquence parente). */
export const Sfx: React.FC<{ at: number; name: SfxName; volume?: number }> = ({ at, name, volume = 1 }) => (
  <Sequence from={Math.max(0, Math.round(at))} layout="none" name={`son ${name}`}>
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);
