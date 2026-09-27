import { AbsoluteFill } from "remotion";
import { CENTER, MONO_FONT, NAVAL_COLORS, tween } from "../constants";
import { OceanSurface } from "./OceanSurface";
import { VESSEL_HEADING, VesselTopView } from "./VesselTopView";
import { Wake } from "./Wake";

const SHIP_SCALE = 1.1;

const CALLOUTS = [
  { label: "HELIDECK", x: -482, y: 0, offsetX: -120, offsetY: -250, delay: 18 },
  { label: "SEARCH RADAR", x: -10, y: 0, offsetX: -40, offsetY: -270, delay: 30 },
  { label: "MAIN GUN", x: 320, y: 0, offsetX: 120, offsetY: -240, delay: 42 },
  { label: "RESCUE BOAT", x: -146, y: 92, offsetX: -200, offsetY: 230, delay: 54 },
  { label: "OPERATIONS CENTER ▸", x: -40, y: 0, offsetX: 190, offsetY: 250, delay: 72, isHighlight: true },
];

function toScreen(x: number, y: number, angleDegrees: number) {
  const angle = (angleDegrees * Math.PI) / 180;
  return {
    x: CENTER.x + (x * Math.cos(angle) - y * Math.sin(angle)) * SHIP_SCALE,
    y: CENTER.y + (x * Math.sin(angle) + y * Math.cos(angle)) * SHIP_SCALE,
  };
}

export const VesselScene: React.FC<{ frame: number }> = ({ frame }) => {
  const heading = VESSEL_HEADING + Math.sin(frame / 30) * 0.6;

  return (
    <AbsoluteFill style={{ backgroundColor: NAVAL_COLORS.deepOcean }}>
      <OceanSurface frame={frame} id="vessel-scene" waveScale={1.6} driftSpeed={2.2} />

      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${CENTER.x}, ${CENTER.y}) rotate(${heading}) scale(${SHIP_SCALE})`}>
          <g transform="translate(-650, 0)">
            <Wake id="vessel-wake" frame={frame} length={1400} />
          </g>
          <path
            d="M 560,-110 Q 700,0 560,110"
            fill="none"
            stroke={NAVAL_COLORS.foam}
            strokeWidth={10}
            strokeOpacity={0.55}
            strokeDasharray="24 14"
            strokeDashoffset={-frame * 3}
          />
          <g filter="drop-shadow(0 18px 18px rgba(0,0,0,0.45))">
            <VesselTopView frame={frame} />
          </g>
        </g>

        {CALLOUTS.map((callout) => {
          const reveal = tween({ frame, start: callout.delay, duration: 22 });
          const anchor = toScreen(callout.x, callout.y, heading);
          const labelX = anchor.x + callout.offsetX;
          const labelY = anchor.y + callout.offsetY;
          const color = callout.isHighlight ? NAVAL_COLORS.amber : NAVAL_COLORS.foam;
          return (
            <g key={callout.label} opacity={reveal}>
              <circle cx={anchor.x} cy={anchor.y} r={7} fill={color} />
              <circle cx={anchor.x} cy={anchor.y} r={7 + ((frame * 0.8) % 24)} fill="none" stroke={color} opacity={1 - ((frame * 0.8) % 24) / 24} />
              <polyline
                points={`${anchor.x},${anchor.y} ${anchor.x + (labelX - anchor.x) * reveal},${anchor.y + (labelY - anchor.y) * reveal} ${labelX + (callout.offsetX >= 0 ? 1 : -1) * 140 * reveal},${labelY}`}
                fill="none"
                stroke={color}
                strokeWidth={2}
              />
              <text
                x={labelX + (callout.offsetX >= 0 ? 8 : -8)}
                y={labelY - 12}
                textAnchor={callout.offsetX >= 0 ? "start" : "end"}
                fontFamily={MONO_FONT}
                fontWeight={700}
                fontSize={20}
                letterSpacing={2}
                fill={color}
              >
                {callout.label}
              </text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
