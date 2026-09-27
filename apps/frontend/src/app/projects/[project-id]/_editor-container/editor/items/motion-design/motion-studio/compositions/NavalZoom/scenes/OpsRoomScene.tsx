import { AbsoluteFill } from "remotion";
import { MONO_FONT, NAVAL_COLORS, tween } from "../constants";

const CONSOLES = [
  { id: "AIR", x: 330, y: 380, angle: 90 },
  { id: "SURFACE", x: 330, y: 600, angle: 90 },
  { id: "SOUS-MARIN", x: 1590, y: 380, angle: -90 },
  { id: "GUERRE ÉLEC.", x: 1590, y: 600, angle: -90 },
  { id: "NAV", x: 660, y: 770, angle: 0 },
  { id: "COMMANDEMENT", x: 960, y: 770, angle: 0, isFocus: true },
  { id: "TRANSMISSIONS", x: 1260, y: 770, angle: 0 },
];

const TRACKS = [
  { x: 520, y: 170, color: NAVAL_COLORS.foam },
  { x: 880, y: 150, color: NAVAL_COLORS.cyan },
  { x: 1210, y: 196, color: NAVAL_COLORS.cyan },
  { x: 1420, y: 160, color: "#FF5A5A" },
];

type ConsoleProps = { frame: number; index: number; id: string; isFocus?: boolean };

const ConsoleTopView: React.FC<ConsoleProps> = ({ frame, index, id, isFocus }) => {
  const screenGlow = 0.65 + 0.35 * Math.abs(Math.sin(frame / 14 + index * 1.7));
  const accent = isFocus ? NAVAL_COLORS.amber : NAVAL_COLORS.cyan;
  return (
    <g>
      <ellipse cx={0} cy={-110} rx={170} ry={120} fill={`url(#ops-glow-${isFocus ? "amber" : "cyan"})`} opacity={screenGlow * 0.8} />
      <rect x={-110} y={-40} width={220} height={80} fill="#0D1B2A" stroke="#20364D" strokeWidth={2} />
      <path d="M -96,-36 L 96,-36 L 84,-6 L -84,-6 Z" fill={accent} opacity={screenGlow} />
      {[0, 1, 2].map((line) => (
        <rect key={line} x={-76} y={-30 + line * 7} width={40 + ((index * 23 + line * 41 + Math.floor(frame / 6) * 17) % 90)} height={3} fill="#021018" opacity={0.6} />
      ))}
      <rect x={-60} y={4} width={120} height={22} rx={4} fill="#16283B" />
      <ellipse cx={0} cy={72} rx={34} ry={22} fill="#0A1622" stroke={accent} strokeOpacity={0.4} strokeWidth={2} />
      <circle cx={0} cy={62} r={16} fill="#1A2A3A" stroke={accent} strokeOpacity={0.6} strokeWidth={2} />
      <text x={0} y={120} textAnchor="middle" fontFamily={MONO_FONT} fontWeight={700} fontSize={16} letterSpacing={2} fill={accent}>
        {id}
      </text>
    </g>
  );
};

export const OpsRoomScene: React.FC<{ frame: number }> = ({ frame }) => {
  const lightsOn = tween({ frame, start: 4, duration: 30 });
  const scanY = 90 + ((frame * 9) % 900);

  return (
    <AbsoluteFill style={{ backgroundColor: "#030A12" }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          {[
            ["cyan", NAVAL_COLORS.cyan],
            ["amber", NAVAL_COLORS.amber],
          ].map(([name, color]) => (
            <radialGradient key={name} id={`ops-glow-${name}`}>
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </radialGradient>
          ))}
          <pattern id="ops-floor" width={40} height={40} patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#12263A" strokeWidth={1} />
          </pattern>
        </defs>

        <rect x={160} y={90} width={1600} height={900} fill="#06121E" />
        <rect x={160} y={90} width={1600} height={900} fill="url(#ops-floor)" />
        <rect x={160} y={90} width={1600} height={900} fill="none" stroke="#2A4560" strokeWidth={6} />

        <g opacity={lightsOn}>
          <rect x={360} y={112} width={1200} height={120} fill="#04192B" stroke={NAVAL_COLORS.cyan} strokeWidth={2} />
          <path d="M 380,200 C 520,150 640,210 780,170 S 1100,120 1240,180 S 1460,150 1540,190" fill="none" stroke={NAVAL_COLORS.cyan} strokeOpacity={0.5} strokeWidth={2} />
          {TRACKS.map((track, index) => {
            const x = track.x + ((frame * (0.6 + index * 0.2)) % 60);
            return (
              <g key={index}>
                <rect x={x - 7} y={track.y - 7} width={14} height={14} fill="none" stroke={track.color} strokeWidth={2} transform={`rotate(45 ${x} ${track.y})`} />
                <line x1={x} y1={track.y} x2={x + 26} y2={track.y - 12} stroke={track.color} strokeWidth={2} />
              </g>
            );
          })}
          <ellipse cx={960} cy={300} rx={640} ry={120} fill="url(#ops-glow-cyan)" />

          <rect x={780} y={390} width={360} height={200} fill="#062033" stroke={NAVAL_COLORS.cyan} strokeWidth={2} />
          {[40, 80, 120].map((radius) => (
            <circle key={radius} cx={960} cy={490} r={radius * 0.7} fill="none" stroke={NAVAL_COLORS.cyan} strokeOpacity={0.35} />
          ))}
          <line
            x1={960}
            y1={490}
            x2={960 + Math.cos(frame / 10) * 84}
            y2={490 + Math.sin(frame / 10) * 84}
            stroke={NAVAL_COLORS.cyan}
            strokeWidth={2}
          />

          {CONSOLES.map((console, index) => (
            <g key={console.id} transform={`translate(${console.x}, ${console.y}) rotate(${console.angle})`}>
              <ConsoleTopView frame={frame} index={index} id={console.id} isFocus={console.isFocus} />
            </g>
          ))}
        </g>

        <rect x={160} y={scanY} width={1600} height={2} fill={NAVAL_COLORS.cyan} opacity={0.18} />
        <text x={190} y={80} fontFamily={MONO_FONT} fontWeight={700} fontSize={18} letterSpacing={3} fill={NAVAL_COLORS.cyan} opacity={lightsOn}>
          CENTRAL OPÉRATIONS · PONT 02
        </text>
      </svg>
    </AbsoluteFill>
  );
};
