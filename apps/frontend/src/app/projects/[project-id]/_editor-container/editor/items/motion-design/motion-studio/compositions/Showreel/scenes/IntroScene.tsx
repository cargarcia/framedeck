import { AbsoluteFill, spring, useVideoConfig } from "remotion";
import { useDesignFrame } from "../../../use-design-frame";
import {
  COLORS,
  DISPLAY_FONT,
  easeInExpo,
  easeInOutQuint,
  MONO_FONT,
  tween,
} from "../constants";

const TITLE = "SHOWREEL";
const RING_COLORS = [COLORS.blue, COLORS.lime, COLORS.orange];
const TAGLINE = "CLAUDE — MOTION DESIGN";

export const IntroScene: React.FC = () => {
  const frame = useDesignFrame();
  const { fps } = useVideoConfig();

  const dotScale = spring({ frame, fps, config: { damping: 9, stiffness: 220 } });
  const dotPulse = tween({ frame, start: 4, duration: 22 });
  const gridDraw = tween({ frame, start: 0, duration: 40, easing: easeInOutQuint });
  const titlePush = tween({ frame, start: 44, duration: 76, from: 1.1, to: 1 });
  const lineDraw = tween({ frame, start: 62, duration: 30 });
  const typedChars = Math.floor(tween({ frame, start: 58, duration: 26, to: TAGLINE.length }));

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink, overflow: "hidden" }}>
      {[0.25, 0.5, 0.75].map((position) => (
        <div
          key={`h-${position}`}
          style={{
            position: "absolute",
            top: `${position * 100}%`,
            left: 0,
            width: "100%",
            height: 1,
            backgroundColor: "rgba(243,240,232,0.14)",
            transform: `scaleX(${gridDraw})`,
          }}
        />
      ))}
      {[0.2, 0.4, 0.6, 0.8].map((position) => (
        <div
          key={`v-${position}`}
          style={{
            position: "absolute",
            left: `${position * 100}%`,
            top: 0,
            height: "100%",
            width: 1,
            backgroundColor: "rgba(243,240,232,0.14)",
            transform: `scaleY(${gridDraw})`,
          }}
        />
      ))}

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            position: "absolute",
            width: 120,
            height: 120,
            borderRadius: "50%",
            border: `2px solid ${COLORS.paper}`,
            opacity: 1 - dotPulse,
            transform: `scale(${0.2 + dotPulse * 1.6})`,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 26,
            height: 26,
            borderRadius: "50%",
            backgroundColor: COLORS.orange,
            transform: `scale(${dotScale})`,
          }}
        />
        {RING_COLORS.map((color, index) => {
          const grow = tween({
            frame,
            start: 16 + index * 7,
            duration: 30,
            easing: easeInOutQuint,
          });
          return (
            <div
              key={color}
              style={{
                position: "absolute",
                width: 26,
                height: 26,
                borderRadius: "50%",
                backgroundColor: color,
                transform: `scale(${grow * 100})`,
              }}
            />
          );
        })}
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${titlePush})`,
        }}
      >
        <div
          style={{
            fontFamily: MONO_FONT,
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: "0.3em",
            color: COLORS.ink,
            height: 40,
            marginBottom: 10,
          }}
        >
          {TAGLINE.slice(0, typedChars)}
          {frame > 56 && frame < 100 && Math.floor(frame / 8) % 2 === 0 ? "▌" : ""}
        </div>
        <div style={{ display: "flex" }}>
          {TITLE.split("").map((letter, index) => {
            const enter = tween({ frame, start: 44 + index * 3, duration: 28 });
            const exit = tween({
              frame,
              start: 100 + index * 1.5,
              duration: 14,
              easing: easeInExpo,
            });
            const offset = (1 - enter) * 110 - exit * 110;
            return (
              <div key={index} style={{ overflow: "hidden", padding: "0 2px" }}>
                <div
                  style={{
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 900,
                    fontSize: 300,
                    lineHeight: 1,
                    letterSpacing: "-0.04em",
                    color: COLORS.ink,
                    transform: `translate3d(0, ${offset}%, 0) rotate(${(1 - enter) * 12}deg)`,
                    willChange: "transform",
                  }}
                >
                  {letter}
                </div>
              </div>
            );
          })}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginTop: 18,
            fontFamily: MONO_FONT,
            fontSize: 26,
            fontWeight: 700,
            color: COLORS.ink,
          }}
        >
          <span style={{ opacity: lineDraw }}>2026</span>
          <div
            style={{
              width: 900,
              height: 4,
              backgroundColor: COLORS.ink,
              transformOrigin: "left",
              transform: `scaleX(${lineDraw})`,
            }}
          />
          <span style={{ opacity: lineDraw }}>15s</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
