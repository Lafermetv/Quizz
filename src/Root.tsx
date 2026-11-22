import React from 'react';
import { Composition, Folder, Still } from 'remotion';
import { Cover } from './Cover';
import { Quiz, quizMetadata } from './Quiz';
import './lib/fonts';
import { loadVideos } from './lib/packs';

// Une vidéo (et une couverture) par fichier de pack dans le dossier packs/.
const videos = loadVideos();

export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="videos">
      {videos.map((v) => (
        <Composition key={v.id} id={v.id} component={Quiz} width={1080} height={1920} fps={30} durationInFrames={300} defaultProps={v.props} calculateMetadata={quizMetadata} />
      ))}
    </Folder>
    <Folder name="couvertures">
      {videos.map((v) => (
        <Still key={v.id} id={`${v.id}-couverture`} component={Cover} width={1080} height={1920} defaultProps={v.props} />
      ))}
    </Folder>
  </>
);
