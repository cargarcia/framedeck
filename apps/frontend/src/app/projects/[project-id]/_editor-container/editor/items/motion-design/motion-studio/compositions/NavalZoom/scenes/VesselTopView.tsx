import { NAVAL_COLORS } from "../constants";

// Plan view of a generic offshore patrol vessel, bow pointing +x, centered on (0, 0), ~1300 units long.
export const VESSEL_LENGTH = 1300;
// Shared heading so the ship keeps the same orientation from the ocean shot to the close-up.
export const VESSEL_HEADING = -8;

const HULL_PATH = "M -650,-88 L 290,-106 Q 560,-96 662,0 Q 560,96 290,106 L -650,88 Z";
const DECK_PATH = "M -636,-78 L 288,-94 Q 540,-86 636,0 Q 540,86 288,94 L -636,78 Z";

export const VesselTopView: React.FC<{ frame: number; isDetailed?: boolean }> = ({ frame, isDetailed = true }) => (
  <g>
    <path d={HULL_PATH} fill={NAVAL_COLORS.steelDark} />
    <path d={DECK_PATH} fill={NAVAL_COLORS.steel} />
    {isDetailed && (
      <>
        <rect x={-632} y={-76} width={300} height={152} fill="#3A4550" />
        <rect x={-622} y={-66} width={280} height={132} fill="none" stroke={NAVAL_COLORS.foam} strokeWidth={3} strokeDasharray="14 10" />
        <circle cx={-482} cy={0} r={52} fill="none" stroke="#F5D547" strokeWidth={6} />
        <text x={-482} y={22} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={900} fontSize={64} fill={NAVAL_COLORS.foam}>
          H
        </text>
        <rect x={-330} y={-80} width={112} height={160} rx={6} fill="#B3BDC7" />
        {[-1, 1].map((side) => (
          <rect key={side} x={-190} y={side * 92 - 14} width={88} height={28} rx={14} fill="#FF7A2F" />
        ))}
        <rect x={-214} y={-76} width={356} height={152} rx={14} fill="#CDD5DD" />
        <rect x={-196} y={-58} width={120} height={116} rx={8} fill="#B8C2CC" />
        <rect x={-150} y={-22} width={46} height={44} rx={6} fill="#4E5A66" />
        <rect x={104} y={-70} width={30} height={140} rx={6} fill="#1B2733" />
        <rect x={112} y={-62} width={10} height={124} fill={NAVAL_COLORS.cyan} opacity={0.55} />
        <circle cx={-10} cy={0} r={30} fill="#E6ECF1" stroke="#7D8995" strokeWidth={3} />
        <g transform={`rotate(${frame * 7}, -10, 0)`}>
          <rect x={-78} y={-7} width={136} height={14} rx={4} fill="#26323E" />
        </g>
        <circle cx={320} cy={0} r={36} fill="#8792A0" stroke="#5B6672" strokeWidth={3} />
        <rect x={340} y={-6} width={120} height={12} rx={4} fill="#5B6672" />
        {[500, 548].map((x) => (
          <circle key={x} cx={x} cy={0} r={9} fill="#6E7A86" />
        ))}
        <text
          x={214}
          y={14}
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
          fontWeight={900}
          fontSize={40}
          fill="#6E7A86"
          letterSpacing={6}
        >
          P01
        </text>
      </>
    )}
  </g>
);
