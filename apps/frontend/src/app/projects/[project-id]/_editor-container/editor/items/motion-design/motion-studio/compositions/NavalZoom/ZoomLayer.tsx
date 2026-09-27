import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CENTER, ZOOM_OVERLAP } from "./constants";

type ZoomLayerProps = {
  frame: number;
  from: number;
  duration: number;
  focus: { x: number; y: number };
  isFirst: boolean;
  isLast: boolean;
  children: (localFrame: number) => React.ReactNode;
};

const ENTER_SCALE = 0.16;
const DRIFT_SCALE = 1.18;
const EXIT_SCALE = 16;
const EXIT_FRAMES = 40;

const easeInCubic = Easing.bezier(0.55, 0, 0.9, 0.35);

// Interpolates in log space so a zoom feels like constant speed regardless of magnitude.
function interpolateLogScale(value: number, range: number[], scales: number[], easing?: (t: number) => number) {
  const logScale = interpolate(value, range, scales.map(Math.log), {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return Math.exp(logScale);
}

// A camera over one scene: grows in from the previous scene's focus, drifts, then dives into its own focus.
export const ZoomLayer: React.FC<ZoomLayerProps> = ({ frame, from, duration, focus, isFirst, isLast, children }) => {
  const localFrame = frame - from;
  if (localFrame < 0 || localFrame >= duration) return null;

  const exitStart = duration - EXIT_FRAMES;
  const enterScale = isFirst
    ? 1
    : interpolateLogScale(localFrame, [0, ZOOM_OVERLAP], [ENTER_SCALE, 1], Easing.bezier(0.2, 0.6, 0.35, 1));
  const driftScale = interpolateLogScale(localFrame, [0, exitStart], [1, DRIFT_SCALE]);
  const exitScale = isLast ? 1 : interpolateLogScale(localFrame, [exitStart, duration], [1, EXIT_SCALE], easeInCubic);
  const scale = enterScale * driftScale * exitScale;

  const focusProgress = isLast
    ? 0
    : interpolate(localFrame, [exitStart - 20, exitStart + 16], [0, 1], {
        easing: Easing.bezier(0.45, 0, 0.55, 1),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
  const focusX = CENTER.x + (focus.x - CENTER.x) * focusProgress;
  const focusY = CENTER.y + (focus.y - CENTER.y) * focusProgress;

  const opacity = Math.min(
    isFirst ? 1 : interpolate(localFrame, [0, ZOOM_OVERLAP * 0.7], [0, 1], { extrapolateRight: "clamp" }),
    isLast ? 1 : interpolate(localFrame, [duration - 18, duration], [1, 0], { extrapolateLeft: "clamp" }),
  );
  // Soft circular reveal, sized to the scaled scene, hides its rectangular edges while it is still small.
  const enterProgress = isFirst ? 1 : Math.min(1, localFrame / ZOOM_OVERLAP);
  const revealReach = scale * (0.9 + 1.7 * enterProgress ** 3);
  const revealMask =
    enterProgress < 1
      ? `radial-gradient(ellipse ${CENTER.x * revealReach}px ${CENTER.y * revealReach}px at 50% 50%, black 60%, transparent 100%)`
      : undefined;
  const exitBlur = isLast ? 0 : interpolate(localFrame, [duration - 16, duration], [0, 6], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill
      style={{
        opacity,
        overflow: "hidden",
        filter: exitBlur > 0.1 ? `blur(${exitBlur}px)` : undefined,
        maskImage: revealMask,
        WebkitMaskImage: revealMask,
      }}
    >
      <AbsoluteFill
        style={{
          transformOrigin: "0 0",
          overflow: "hidden",
          transform: `translate(${CENTER.x}px, ${CENTER.y}px) scale(${scale}) translate(${-focusX}px, ${-focusY}px)`,
        }}
      >
        {children(localFrame)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
