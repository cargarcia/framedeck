import { AbsoluteFill, interpolate } from "remotion";
import { useDesignFrame } from "../../../use-design-frame";
import { COLORS, DISPLAY_FONT, MONO_FONT, tween } from "../constants";

const RING_COUNT = 18;
const RING_SPACING = 420;
const TUNNEL_DEPTH = RING_COUNT * RING_SPACING;
const RING_COLORS = [COLORS.blue, COLORS.orange, COLORS.paper];
const WORD = "DEPTH";

const CARDS = [
  { label: "PARALLAX", x: -640, y: -250, color: COLORS.orange, offset: 0 },
  { label: "CAMERA", x: 660, y: 220, color: COLORS.lime, offset: 1600 },
  { label: "Z-SPACE", x: 600, y: -280, color: COLORS.blue, offset: 3400 },
  { label: "DOLLY", x: -620, y: 260, color: COLORS.paper, offset: 5200 },
];

// Wraps a travelling z position inside the tunnel so rings loop forever.
function wrapDepth(depth: number): number {
  return (((depth % TUNNEL_DEPTH) + TUNNEL_DEPTH) % TUNNEL_DEPTH) - TUNNEL_DEPTH + 300;
}

export const DepthScene: React.FC = () => {
  const frame = useDesignFrame();

  // Constant cruise, then an accelerating dolly into the flash.
  const travel = frame * 34 + Math.max(0, frame - 100) ** 2 * 1.6;
  const cameraRoll = Math.sin(frame / 38) * 5;
  const flash = tween({ frame, start: 138, duration: 12 });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 50%, #1B2270 0%, ${COLORS.night} 55%)`,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          perspective: 900,
          alignItems: "center",
          justifyContent: "center",
          transform: `rotate(${cameraRoll}deg)`,
        }}
      >
        {Array.from({ length: RING_COUNT }, (_, index) => {
          const depth = wrapDepth(index * RING_SPACING + travel);
          const opacity = interpolate(depth, [-TUNNEL_DEPTH + 300, -4000, -200, 300], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={index}
              style={{
                position: "absolute",
                width: 1500,
                height: 860,
                border: `4px solid ${RING_COLORS[index % RING_COLORS.length]}`,
                borderRadius: index % 3 === 0 ? 430 : 0,
                opacity,
                transform: `translateZ(${depth}px) rotate(${index * 7 + frame * 0.5}deg)`,
              }}
            />
          );
        })}

        {CARDS.map((card) => {
          const depth = wrapDepth(card.offset + travel * 1.2);
          const opacity = interpolate(depth, [-6000, -3500, 0, 300], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={card.label}
              style={{
                position: "absolute",
                width: 360,
                height: 220,
                backgroundColor: card.color,
                borderRadius: 18,
                display: "flex",
                alignItems: "flex-end",
                padding: 24,
                boxSizing: "border-box",
                fontFamily: MONO_FONT,
                fontWeight: 700,
                fontSize: 30,
                color: COLORS.ink,
                opacity,
                transform: `translate3d(${card.x}px, ${card.y}px, ${depth}px) rotateY(${card.x > 0 ? -28 : 28}deg)`,
              }}
            >
              {card.label}
            </div>
          );
        })}

        <div style={{ display: "flex", transformStyle: "preserve-3d" }}>
          {WORD.split("").map((letter, index) => {
            const flip = tween({ frame, start: 6 + index * 4, duration: 34 });
            const sway = Math.sin((frame - index * 6) / 22) * 14;
            return (
              <div
                key={index}
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 900,
                  fontSize: 250,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  color: COLORS.paper,
                  textShadow: `0 0 60px ${COLORS.blue}`,
                  opacity: flip,
                  transform: `translateZ(${(1 - flip) * -900}px) rotateX(${(1 - flip) * 100}deg) rotateY(${sway}deg)`,
                }}
              >
                {letter}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: COLORS.paper, opacity: flash }} />
    </AbsoluteFill>
  );
};
