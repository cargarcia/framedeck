import { AbsoluteFill, spring, useVideoConfig } from "remotion";
import { useDesignFrame } from "../../../use-design-frame";
import { COLORS, DISPLAY_FONT, easeInExpo, MONO_FONT, tween } from "../constants";

const VALUES = [0.22, 0.3, 0.26, 0.38, 0.35, 0.46, 0.42, 0.55, 0.52, 0.64, 0.7, 0.66, 0.84, 1];
const CHART_LEFT = 900;
const CHART_BOTTOM = 850;
const CHART_HEIGHT = 560;
const BAR_WIDTH = 42;
const BAR_GAP = 20;
const PEAK_INDEX = VALUES.length - 1;

const points = VALUES.map((value, index) => ({
  x: CHART_LEFT + index * (BAR_WIDTH + BAR_GAP) + BAR_WIDTH / 2,
  y: CHART_BOTTOM - value * CHART_HEIGHT - 40,
}));
const segmentLengths = points
  .slice(1)
  .map((point, index) => Math.hypot(point.x - points[index]!.x, point.y - points[index]!.y));
const totalLength = segmentLengths.reduce((sum, length) => sum + length, 0);

// Walks the polyline to find where the drawing tip sits for a given progress.
function findPointAtProgress(progress: number) {
  let remaining = progress * totalLength;
  for (let index = 0; index < segmentLengths.length; index++) {
    const length = segmentLengths[index]!;
    if (remaining <= length) {
      const ratio = remaining / length;
      const start = points[index]!;
      const end = points[index + 1]!;
      return { x: start.x + (end.x - start.x) * ratio, y: start.y + (end.y - start.y) * ratio };
    }
    remaining -= length;
  }
  return points[points.length - 1]!;
}

export const DataScene: React.FC = () => {
  const frame = useDesignFrame();
  const { fps } = useVideoConfig();

  const counter = tween({ frame, start: 8, duration: 62 });
  const lineDraw = tween({ frame, start: 26, duration: 56 });
  const tip = findPointAtProgress(lineDraw);
  const headline = tween({ frame, start: 4, duration: 26 });
  const exit = tween({ frame, start: 100, duration: 20, easing: easeInExpo });
  const peakPop = spring({ frame: frame - 78, fps, config: { damping: 10, stiffness: 200 } });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 250,
          transform: `translate3d(0, ${exit * -700}px, 0)`,
        }}
      >
        <div
          style={{
            fontFamily: MONO_FONT,
            fontWeight: 700,
            fontSize: 26,
            letterSpacing: "0.2em",
            color: COLORS.ink,
            opacity: headline,
          }}
        >
          DATA → STORY
        </div>
        <div
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 900,
            fontSize: 230,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            color: COLORS.ink,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {`+${Math.round(counter * 248)}%`}
        </div>
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 500,
              fontSize: 46,
              color: COLORS.ink,
              transform: `translate3d(0, ${(1 - headline) * 100}%, 0)`,
            }}
          >
            numbers that <span style={{ color: COLORS.orange, fontWeight: 800 }}>move</span> people.
          </div>
        </div>
      </div>

      {VALUES.map((value, index) => {
        const grow = spring({
          frame: frame - 6 - index * 2,
          fps,
          config: { damping: 14, stiffness: 160 },
        });
        const collapse = tween({ frame, start: 96 + index, duration: 14, easing: easeInExpo });
        const isPeak = index === PEAK_INDEX;
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: CHART_LEFT + index * (BAR_WIDTH + BAR_GAP),
              top: CHART_BOTTOM - value * CHART_HEIGHT,
              width: BAR_WIDTH,
              height: value * CHART_HEIGHT,
              backgroundColor: isPeak ? COLORS.orange : COLORS.ink,
              opacity: isPeak ? 1 : 0.85,
              transformOrigin: "bottom",
              transform: `scaleY(${grow * (1 - collapse)})`,
            }}
          />
        );
      })}

      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0, opacity: 1 - exit }}
      >
        <polyline
          points={points.map((point) => `${point.x},${point.y}`).join(" ")}
          fill="none"
          stroke={COLORS.blue}
          strokeWidth={6}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={totalLength}
          strokeDashoffset={totalLength * (1 - lineDraw)}
        />
        <circle cx={tip.x} cy={tip.y} r={16 * Math.min(lineDraw * 8, 1)} fill={COLORS.blue} />
        <circle
          cx={tip.x}
          cy={tip.y}
          r={16 + ((frame * 1.6) % 40)}
          fill="none"
          stroke={COLORS.blue}
          strokeWidth={3}
          opacity={lineDraw > 0 ? 1 - ((frame * 1.6) % 40) / 40 : 0}
        />
      </svg>

      <div
        style={{
          position: "absolute",
          left: points[PEAK_INDEX]!.x - 110,
          top: points[PEAK_INDEX]!.y - 110,
          padding: "10px 18px",
          borderRadius: 999,
          backgroundColor: COLORS.ink,
          color: COLORS.lime,
          fontFamily: MONO_FONT,
          fontWeight: 700,
          fontSize: 24,
          whiteSpace: "nowrap",
          transformOrigin: "bottom right",
          transform: `scale(${peakPop * (1 - exit)})`,
        }}
      >
        ALL-TIME HIGH
      </div>
      <div
        style={{
          position: "absolute",
          left: CHART_LEFT - 20,
          top: CHART_BOTTOM,
          width: VALUES.length * (BAR_WIDTH + BAR_GAP) + 20,
          height: 3,
          backgroundColor: COLORS.ink,
          transformOrigin: "left",
          transform: `scaleX(${tween({ frame, start: 0, duration: 20 }) * (1 - exit)})`,
        }}
      />
    </AbsoluteFill>
  );
};
