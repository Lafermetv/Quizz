import React from 'react';

/** « l'expression » → préfixe « L' » + mot mis en couleur « EXPRESSION ». */
export const splitDevine = (devine: string) => {
  const s = devine.trim().toUpperCase();
  const i = Math.max(s.lastIndexOf(' '), s.lastIndexOf("'"), s.lastIndexOf('’'));
  return { prefix: s.slice(0, i + 1), word: s.slice(i + 1) };
};

/** Taille de police pour qu'une ligne tienne dans la largeur (police Lilita One). */
export const fitFont = (text: string, base: number, maxWidth = 980) => Math.min(base, maxWidth / (text.length * 0.56));

export const DevineWord: React.FC<{ devine: string; acc: string }> = ({ devine, acc }) => {
  const { prefix, word } = splitDevine(devine);
  return (
    <>
      {prefix}
      <span style={{ color: acc }}>{word}</span>
    </>
  );
};
