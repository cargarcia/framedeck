import { AbsoluteFill } from "remotion";
import { CENTER, MONO_FONT, NAVAL_COLORS, tween } from "../constants";
import { OceanSurface } from "./OceanSurface";
import { VESSEL_HEADING, VesselTopView } from "./VesselTopView";
import { Wake } from "./Wake";

const SHIP_SCALE = 0.05;

export const OceanScene: React.FC<{ frame: number }> = ({ frame }) => {
  const gridIn = tween({ frame, start: 10, duration: 40 });
  const labelIn = tween({ frame, start: 40, duration: 24 });
  const wakeGrow = tween({ frame, start: 0, duration: 90 });

  return (
    <AbsoluteFill style={{ backgroundColor: NAVAL_COLORS.deepOcean }}>
      <OceanSurface frame={frame} id="ocean-scene" waveScale={0.55} driftSpeed={0.35} />

      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <g opacity={gridIn * 0.35} stroke={NAVAL_COLORS.foam} strokeWidth={1}>
          {[240, 720, 1200, 1680].map((x) => (
            <line key={x} x1={x} y1={0} x2={x} y2={1080} strokeDasharray="2 8" />
          ))}
          {[180, 540, 900].map((y) => (
            <line key={y} x1={0} y1={y} x2={1920} y2={y} strokeDasharray="2 8" />
          ))}
        </g>
        <g fontFamily={MONO_FONT} fontSize={16} fill={NAVAL_COLORS.foam} opacity={gridIn * 0.6}>
          <text x={248} y={172}>46°30′N</text>
          <text x={248} y={532}>46°12′N</text>
          <text x={728} y={1068}>6°20′W</text>
          <text x={1208} y={1068}>5°50′W</text>
        </g>

        {[0, 1, 2].map((ring) => {
          const pulse = ((frame + ring * 26) % 78) / 78;
          return (
            <circle
              key={ring}
              cx={CENTER.x}
              cy={CENTER.y}
              r={20 + pulse * 260}
              fill="none"
              stroke={NAVAL_COLORS.cyan}
              strokeWidth={2}
              opacity={(1 - pulse) * 0.6}
            />
          );
        })}

        <g transform={`translate(${CENTER.x}, ${CENTER.y}) rotate(${VESSEL_HEADING}) scale(${SHIP_SCALE})`}>
          <g transform="translate(-650, 0)">
            <Wake id="ocean-wake" frame={frame} length={9000 * wakeGrow + 400} />
          </g>
          <VesselTopView frame={frame} isDetailed={false} />
        </g>
      </svg>

      <div
        style={{
          position: "absolute",
          left: CENTER.x + 60,
          top: CENTER.y + 40,
          fontFamily: MONO_FONT,
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: NAVAL_COLORS.foam,
          opacity: labelIn,
          transform: `translate3d(${(1 - labelIn) * 20}px, 0, 0)`,
        }}
      >
        <div style={{ color: NAVAL_COLORS.cyan }}>CONTACT · OPV</div>
        <div style={{ opacity: 0.75, fontWeight: 500 }}>17 KN · HDG 082°</div>
      </div>
    </AbsoluteFill>
  );
};
