import { AbsoluteFill, Img, staticFile } from "remotion";
import { MONO_FONT, NAVAL_COLORS, tween } from "../constants";

// Source photo is 1000x651; it is scaled to cover 1920 wide and centered vertically.
const PHOTO = { src: "motion-studio/naval-opv.jpg", width: 1000, height: 651 };
const PHOTO_SCALE = 1920 / PHOTO.width;
const PHOTO_OFFSET_Y = (1080 - PHOTO.height * PHOTO_SCALE) / 2;

function toScreen(photoX: number, photoY: number) {
  return { x: photoX * PHOTO_SCALE, y: photoY * PHOTO_SCALE + PHOTO_OFFSET_Y };
}

const CALLOUTS = [
  { label: "MAST · SENSORS", point: toScreen(410, 160), offsetX: -170, offsetY: -60, delay: 20 },
  { label: "AFT DECK · RHIB", point: toScreen(215, 355), offsetX: 80, offsetY: 200, delay: 34 },
  { label: "MAIN GUN", point: toScreen(695, 372), offsetX: 170, offsetY: -150, delay: 46 },
  { label: "BRIDGE · OPERATIONS ▸", point: toScreen(462, 298), offsetX: 150, offsetY: -190, delay: 66, isHighlight: true },
];

// Tracking box around the hull, in screen space.
const TARGET_BOX = { ...toScreen(110, 140), right: toScreen(905, 530).x, bottom: toScreen(905, 530).y };

export const VesselScene: React.FC<{ frame: number }> = ({ frame }) => {
  const kenBurns = tween({ frame, start: 0, duration: 174, from: 1.04, to: 1.0 });
  const lockIn = tween({ frame, start: 4, duration: 30 });
  const boxInset = (1 - lockIn) * 120;
  const scanX = TARGET_BOX.x + ((frame * 14) % (TARGET_BOX.right - TARGET_BOX.x));

  return (
    <AbsoluteFill style={{ backgroundColor: NAVAL_COLORS.deepOcean, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${kenBurns}) translate3d(${(1 - kenBurns) * 400}px, 0, 0)` }}>
        <Img
          src={staticFile(PHOTO.src)}
          style={{ position: "absolute", left: 0, top: PHOTO_OFFSET_Y, width: 1920, height: PHOTO.height * PHOTO_SCALE }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 55%, transparent 45%, rgba(2,10,23,0.7) 100%), linear-gradient(180deg, rgba(6,35,71,0.25), rgba(2,10,23,0.35))`,
        }}
      />

      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <g stroke={NAVAL_COLORS.cyan} strokeWidth={3} fill="none" opacity={lockIn}>
          {[
            [TARGET_BOX.x + boxInset, TARGET_BOX.y + boxInset, 1, 1],
            [TARGET_BOX.right - boxInset, TARGET_BOX.y + boxInset, -1, 1],
            [TARGET_BOX.x + boxInset, TARGET_BOX.bottom - boxInset, 1, -1],
            [TARGET_BOX.right - boxInset, TARGET_BOX.bottom - boxInset, -1, -1],
          ].map(([x, y, dx, dy]) => (
            <polyline key={`${x}-${y}`} points={`${x},${y! + dy! * 50} ${x},${y} ${x! + dx! * 50},${y}`} />
          ))}
        </g>
        <line x1={scanX} y1={TARGET_BOX.y} x2={scanX} y2={TARGET_BOX.bottom} stroke={NAVAL_COLORS.cyan} strokeOpacity={0.35 * lockIn} strokeWidth={2} />
        <text
          x={TARGET_BOX.x + 70}
          y={TARGET_BOX.y + 40}
          fontFamily={MONO_FONT}
          fontWeight={700}
          fontSize={20}
          letterSpacing={3}
          fill={NAVAL_COLORS.cyan}
          opacity={lockIn}
        >
          {`TRACK LOCKED · OPV · ${(0.4 + lockIn * 0.59).toFixed(2)} CONF`}
        </text>

        {CALLOUTS.map((callout) => {
          const reveal = tween({ frame, start: callout.delay, duration: 22 });
          const anchor = callout.point;
          const labelX = anchor.x + callout.offsetX;
          const labelY = anchor.y + callout.offsetY;
          const color = callout.isHighlight ? NAVAL_COLORS.amber : NAVAL_COLORS.foam;
          const direction = callout.offsetX >= 0 ? 1 : -1;
          const ripple = (frame * 0.8) % 24;
          return (
            <g key={callout.label} opacity={reveal} style={{ filter: "drop-shadow(0 0 6px rgba(0,0,0,0.8))" }}>
              <circle cx={anchor.x} cy={anchor.y} r={7} fill={color} />
              <circle cx={anchor.x} cy={anchor.y} r={7 + ripple} fill="none" stroke={color} opacity={1 - ripple / 24} />
              <polyline
                points={`${anchor.x},${anchor.y} ${anchor.x + (labelX - anchor.x) * reveal},${anchor.y + (labelY - anchor.y) * reveal} ${labelX + direction * 230 * reveal},${labelY}`}
                fill="none"
                stroke={color}
                strokeWidth={2}
              />
              <text
                x={labelX + direction * 8}
                y={labelY - 12}
                textAnchor={direction > 0 ? "start" : "end"}
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
