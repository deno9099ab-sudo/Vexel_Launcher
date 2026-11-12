const PALETTES: Record<number, { base: string; shade: string; hair: string; eye: string }> = {
  3: { base: '#d9a066', shade: '#b07a45', hair: '#3c2f1e', eye: '#2f4f7a' },
  7: { base: '#f0c89e', shade: '#c99b6d', hair: '#141414', eye: '#3f6b3f' },
  11: { base: '#c98d58', shade: '#9c6a3e', hair: '#5a3a1a', eye: '#27354a' },
  19: { base: '#e8b98a', shade: '#ba8f63', hair: '#7a4c21', eye: '#1f1f1f' },
  23: { base: '#d09568', shade: '#a97649', hair: '#20160c', eye: '#57321a' },
  31: { base: '#efc49a', shade: '#c79a70', hair: '#4a2f14', eye: '#2c4f30' },
};

const FACE = [
  // 8x8: 0 skin, 1 hair, 2 eye, 3 shade, 4 mouth
  1, 1, 1, 1, 1, 1, 1, 1,
  1, 0, 0, 0, 0, 0, 0, 1,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 2, 0, 0, 0, 0, 2, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 4, 4, 0, 0, 0,
  3, 0, 0, 0, 0, 0, 0, 3,
  3, 3, 0, 0, 0, 0, 3, 3,
];

export function Avatar({ seed, size = 40, className = '' }: { seed: number; size?: number; className?: string }) {
  const p = PALETTES[seed] ?? PALETTES[3];
  const colors = [p.base, p.hair, p.eye, p.shade, '#8a4a2e'];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 8 8"
      shapeRendering="crispEdges"
      className={className}
      aria-label="Avatar người chơi"
    >
      {FACE.map((c, i) => (
        <rect key={i} x={i % 8} y={Math.floor(i / 8)} width={1} height={1} fill={colors[c]} />
      ))}
    </svg>
  );
}
