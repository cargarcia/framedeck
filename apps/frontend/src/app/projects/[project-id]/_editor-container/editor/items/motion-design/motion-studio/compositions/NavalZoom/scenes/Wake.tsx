import { NAVAL_COLORS } from "../constants";

type WakeProps = { id: string; frame: number; length: number };

// Kelvin wake behind a ship pointing +x with its stern at x = 0: a turbulent trail plus two diverging arms.
export const Wake: React.FC<WakeProps> = ({ id, frame, length }) => {
  const armSpread = length * 0.34;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-fade`} x1="1" x2="0" y1="0" y2="0">
          <stop offset="0%" stopColor={NAVAL_COLORS.foam} stopOpacity={0.9} />
          <stop offset="100%" stopColor={NAVAL_COLORS.foam} stopOpacity={0} />
        </linearGradient>
        <filter id={`${id}-foam`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.08" numOctaves={3} seed={Math.floor(frame / 3) % 6} />
          <feDisplacementMap in="SourceGraphic" scale={length * 0.03} />
        </filter>
      </defs>
      <g filter={`url(#${id}-foam)`}>
        <path
          d={`M 0,${-length * 0.05} L ${-length},${-length * 0.12} L ${-length},${length * 0.12} L 0,${length * 0.05} Z`}
          fill={`url(#${id}-fade)`}
          opacity={0.75}
        />
        {[-1, 1].map((side) => (
          <path
            key={side}
            d={`M ${length * 0.02},${side * length * 0.05} L ${-length},${side * armSpread}`}
            stroke={`url(#${id}-fade)`}
            strokeWidth={length * 0.012}
            fill="none"
          />
        ))}
      </g>
    </g>
  );
};
