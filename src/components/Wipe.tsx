import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';

/**
 * Transition en diagonale : la nouvelle manche entre en balayant l'écran,
 * avec une bande de couleur sur le bord.
 */
export const Wipe: React.FC<{ duration: number; color: string; children: React.ReactNode }> = ({ duration, color, children }) => {
  const f = useCurrentFrame();
  if (duration <= 0 || f >= duration) return <AbsoluteFill>{children}</AbsoluteFill>;
  const p = interpolate(f, [0, duration], [0, 1], { easing: Easing.inOut(Easing.cubic), extrapolateRight: 'clamp' });
  const slant = 35;
  const x1 = p * (100 + slant);
  const x2 = x1 - slant;
  const band = 7;
  return (
    <AbsoluteFill style={{ clipPath: `polygon(0 0, ${x1}% 0, ${x2}% 100%, 0 100%)` }}>
      {children}
      <AbsoluteFill style={{ background: color, clipPath: `polygon(${x1 - band}% 0, ${x1}% 0, ${x2}% 100%, ${x2 - band}% 100%)` }} />
      <AbsoluteFill style={{ background: '#fff', clipPath: `polygon(${x1 - band - 1.6}% 0, ${x1 - band}% 0, ${x2 - band}% 100%, ${x2 - band - 1.6}% 100%)` }} />
    </AbsoluteFill>
  );
};
