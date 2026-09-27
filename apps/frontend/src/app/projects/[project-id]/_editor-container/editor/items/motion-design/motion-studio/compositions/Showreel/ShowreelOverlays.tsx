import { AbsoluteFill } from "remotion";
import { COLORS, easeInOutQuint, MONO_FONT, SCENES, SHOWREEL_DURATION, SHOWREEL_FPS, tween } from "./constants";

type FrameProps = { frame: number };

type StripeWipeProps = FrameProps & { cutFrame: number; colors: string[] };

// Stacked skewed panels: the top panel fully covers the frame at `cutFrame`, hiding the hard cut.
export const StripeWipe: React.FC<StripeWipeProps> = ({ frame, cutFrame, colors }) => {
  if (frame < cutFrame - 20 || frame > cutFrame + 24) return null;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {colors.map((color, index) => {
        const enter = tween({
          frame,
          start: cutFrame - 18 + index * 3,
          duration: 12,
          easing: easeInOutQuint,
        });
        const exit = tween({
          frame,
          start: cutFrame + (colors.length - 1 - index) * 3,
          duration: 14,
          easing: easeInOutQuint,
        });
        return (
          <div
            key={color}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "-20%",
              width: "140%",
              backgroundColor: color,
              transform: `translate3d(${(1 - enter) * 100 - exit * 100}%, 0, 0) skewX(-14deg)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

function formatTimecode(frame: number): string {
  const seconds = Math.floor(frame / SHOWREEL_FPS);
  const frames = Math.floor(frame % SHOWREEL_FPS);
  return `00:00:${String(seconds).padStart(2, "0")}:${String(frames).padStart(2, "0")}`;
}

const cornerStyle = (vertical: "top" | "bottom", horizontal: "left" | "right"): React.CSSProperties => ({
  position: "absolute",
  [vertical]: 48,
  [horizontal]: 48,
  width: 36,
  height: 36,
  [`border${vertical === "top" ? "Top" : "Bottom"}`]: "3px solid white",
  [`border${horizontal === "left" ? "Left" : "Right"}`]: "3px solid white",
});

// Camera-style HUD; difference blending keeps it readable on every background.
export const ShowreelHud: React.FC<FrameProps> = ({ frame }) => {
  const sceneIndex = SCENES.findIndex((scene) => frame < scene.from + scene.duration);
  const scene = SCENES[Math.max(sceneIndex, 0)]!;
  const labelReveal = tween({ frame: frame - scene.from, start: 4, duration: 16 });
  const hudReveal = tween({ frame, start: 10, duration: 30 });
  const hudFade = 1 - tween({ frame, start: SHOWREEL_DURATION - 24, duration: 14 });
  const textStyle: React.CSSProperties = {
    position: "absolute",
    fontFamily: MONO_FONT,
    fontWeight: 700,
    fontSize: 20,
    letterSpacing: "0.14em",
    color: "white",
  };

  return (
    <AbsoluteFill style={{ mixBlendMode: "difference", opacity: hudReveal * hudFade }}>
      <div style={cornerStyle("top", "left")} />
      <div style={cornerStyle("top", "right")} />
      <div style={cornerStyle("bottom", "left")} />
      <div style={cornerStyle("bottom", "right")} />
      <div style={{ ...textStyle, top: 62, left: 104 }}>CLAUDE / MOTION REEL ’26</div>
      <div style={{ ...textStyle, top: 62, right: 104, fontVariantNumeric: "tabular-nums" }}>
        {formatTimecode(frame)}
      </div>
      <div style={{ ...textStyle, bottom: 62, left: 104, overflow: "hidden" }}>
        <div style={{ transform: `translate3d(0, ${(1 - labelReveal) * 100}%, 0)` }}>
          {`${String(sceneIndex + 1).padStart(2, "0")} — ${scene.label.toUpperCase()}`}
        </div>
      </div>
      <div style={{ ...textStyle, bottom: 62, right: 104, display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            backgroundColor: "white",
            opacity: Math.floor(frame / 30) % 2 === 0 ? 1 : 0.2,
          }}
        />
        REC
      </div>
      <div
        style={{
          position: "absolute",
          left: 104,
          right: 104,
          bottom: 40,
          height: 2,
          backgroundColor: "white",
          transformOrigin: "left",
          transform: `scaleX(${frame / SHOWREEL_DURATION})`,
        }}
      />
    </AbsoluteFill>
  );
};

export const FilmGrain: React.FC<FrameProps> = ({ frame }) => (
  <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.22, pointerEvents: "none" }}>
    <svg width="100%" height="100%">
      <filter id="showreel-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={Math.floor(frame / 2) % 12} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#showreel-grain)" />
    </svg>
  </AbsoluteFill>
);

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at center, transparent 55%, ${COLORS.ink}66 100%)`,
      pointerEvents: "none",
    }}
  />
);
