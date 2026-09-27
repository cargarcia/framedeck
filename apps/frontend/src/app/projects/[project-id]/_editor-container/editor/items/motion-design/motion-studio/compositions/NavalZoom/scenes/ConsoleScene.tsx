import { AbsoluteFill } from "remotion";
import { MONO_FONT, NAVAL_COLORS, tween } from "../constants";

const RADAR = { x: 620, y: 590, radius: 360 };
const SWEEP_SPEED = 3.2;

const CONTACTS = [
  { id: "0412", bearing: 38, range: 0.72, classification: "MERCHANT", color: NAVAL_COLORS.cyan },
  { id: "0415", bearing: 112, range: 0.48, classification: "FISHING", color: NAVAL_COLORS.cyan },
  { id: "0419", bearing: 205, range: 0.83, classification: "UNKNOWN", color: NAVAL_COLORS.amber },
  { id: "0421", bearing: 287, range: 0.35, classification: "FRIENDLY", color: "#6BFFB0" },
  { id: "0427", bearing: 330, range: 0.6, classification: "AIR", color: "#FF6B6B" },
];

export const ConsoleScene: React.FC<{ frame: number }> = ({ frame }) => {
  const bootIn = tween({ frame, start: 0, duration: 26 });
  const sweepAngle = (frame * SWEEP_SPEED) % 360;
  const waveform = Array.from({ length: 120 }, (_, index) => {
    const x = 1110 + index * 5.5;
    const y = 880 + Math.sin(index / 5 + frame / 6) * 22 + Math.sin(index / 1.7 - frame / 3) * 8;
    return `${x},${y.toFixed(1)}`;
  }).join(" ");

  return (
    <AbsoluteFill style={{ backgroundColor: "#0B141D" }}>
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 80,
          width: 1700,
          height: 920,
          borderRadius: 26,
          background: "#010A10",
          boxShadow: `inset 0 0 0 3px #1E3246, 0 0 120px rgba(63,216,255,0.15)`,
          overflow: "hidden",
          opacity: 0.4 + bootIn * 0.6,
        }}
      />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: bootIn }}>
        <g fontFamily={MONO_FONT} fontWeight={700} fontSize={18} letterSpacing={2} fill={NAVAL_COLORS.cyan}>
          <text x={150} y={190}>TACTICAL SITUATION · COMMAND</text>
          <text x={1770} y={190} textAnchor="end">
            {`14:32:${String(7 + Math.floor(frame / 60)).padStart(2, "0")}Z`}
          </text>
        </g>
        <line x1={150} y1={210} x2={1770} y2={210} stroke={NAVAL_COLORS.cyan} strokeOpacity={0.3} />

        {[0.25, 0.5, 0.75, 1].map((ring) => (
          <circle key={ring} cx={RADAR.x} cy={RADAR.y} r={RADAR.radius * ring} fill="none" stroke={NAVAL_COLORS.cyan} strokeOpacity={0.28} />
        ))}
        {Array.from({ length: 12 }, (_, index) => {
          const angle = (index * 30 * Math.PI) / 180;
          return (
            <line
              key={index}
              x1={RADAR.x}
              y1={RADAR.y}
              x2={RADAR.x + Math.sin(angle) * RADAR.radius}
              y2={RADAR.y - Math.cos(angle) * RADAR.radius}
              stroke={NAVAL_COLORS.cyan}
              strokeOpacity={0.12}
            />
          );
        })}

        {CONTACTS.map((contact) => {
          const angle = (contact.bearing * Math.PI) / 180;
          const x = RADAR.x + Math.sin(angle) * RADAR.radius * contact.range;
          const y = RADAR.y - Math.cos(angle) * RADAR.radius * contact.range;
          const sinceSweep = (sweepAngle - contact.bearing + 360) % 360;
          const glow = Math.max(0.25, 1 - sinceSweep / 300);
          return (
            <g key={contact.id} opacity={glow}>
              <rect x={x - 9} y={y - 9} width={18} height={18} fill="none" stroke={contact.color} strokeWidth={2.5} />
              <text x={x + 16} y={y - 12} fontFamily={MONO_FONT} fontSize={15} fontWeight={700} fill={contact.color}>
                {contact.id}
              </text>
            </g>
          );
        })}
        <path d={`M ${RADAR.x - 10},${RADAR.y + 12} L ${RADAR.x},${RADAR.y - 16} L ${RADAR.x + 10},${RADAR.y + 12} Z`} fill={NAVAL_COLORS.foam} />

        <g fontFamily={MONO_FONT} fontSize={17}>
          <text x={1110} y={260} fill={NAVAL_COLORS.cyan} fontWeight={700} letterSpacing={2}>
            TRACK   BRG   RNG    CLASS
          </text>
          {CONTACTS.map((contact, index) => {
            const rowIn = tween({ frame, start: 10 + index * 5, duration: 16 });
            return (
              <text key={contact.id} x={1110} y={300 + index * 38} fill={contact.color} opacity={rowIn} fontWeight={500}>
                {`${contact.id}    ${String(contact.bearing).padStart(3, "0")}   ${(contact.range * 24).toFixed(1).padStart(4, " ")}   ${contact.classification}`}
              </text>
            );
          })}
        </g>

        {["SIGNAL", "CONFIDENCE", "THREAT", "LINK"].map((label, index) => {
          const level = 0.35 + 0.6 * Math.abs(Math.sin(frame / (18 + index * 5) + index));
          return (
            <g key={label} transform={`translate(1110, ${520 + index * 62})`}>
              <text y={0} fontFamily={MONO_FONT} fontSize={15} fontWeight={700} fill={NAVAL_COLORS.cyan} opacity={0.7} letterSpacing={2}>
                {label}
              </text>
              <rect y={12} width={600} height={14} fill="#0E2436" />
              <rect y={12} width={600 * level * bootIn} height={14} fill={index === 2 ? NAVAL_COLORS.amber : NAVAL_COLORS.cyan} />
            </g>
          );
        })}
        <polyline points={waveform} fill="none" stroke={NAVAL_COLORS.cyan} strokeWidth={2} />
      </svg>

      <div
        style={{
          position: "absolute",
          left: RADAR.x - RADAR.radius,
          top: RADAR.y - RADAR.radius,
          width: RADAR.radius * 2,
          height: RADAR.radius * 2,
          borderRadius: "50%",
          background: `conic-gradient(from ${sweepAngle - 70}deg, rgba(63,216,255,0) 0deg, rgba(63,216,255,0.42) 70deg, rgba(63,216,255,0) 70.5deg)`,
          opacity: bootIn,
        }}
      />
    </AbsoluteFill>
  );
};
