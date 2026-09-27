import { AbsoluteFill, random, spring, useVideoConfig } from "remotion";
import { useDesignFrame } from "../../../use-design-frame";
import { COLORS, DISPLAY_FONT, easeInOutQuint, MONO_FONT, tween } from "../constants";

const NAME = "CLAUDE";
const ROLE = "Motion Designer — available for new projects";

export const OutroScene: React.FC = () => {
  const frame = useDesignFrame();
  const { fps } = useVideoConfig();

  const dotPop = spring({ frame: frame - 22, fps, config: { damping: 8, stiffness: 240 } });
  const lineDraw = tween({ frame, start: 30, duration: 26 });
  const typedChars = Math.floor(tween({ frame, start: 36, duration: 34, to: ROLE.length }));
  const pillPop = spring({ frame: frame - 62, fps, config: { damping: 12, stiffness: 200 } });
  const iris = tween({ frame, start: 98, duration: 20, easing: easeInOutQuint });
  const slowPush = tween({ frame, start: 0, duration: 120, from: 1.06, to: 1 });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      <AbsoluteFill
        style={{
          backgroundColor: COLORS.ink,
          alignItems: "center",
          justifyContent: "center",
          clipPath: `circle(${(1 - iris) * 75}% at 50% 50%)`,
          transform: `scale(${slowPush})`,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline" }}>
          {NAME.split("").map((letter, index) => {
            const land = spring({
              frame: frame - index * 2,
              fps,
              config: { damping: 15, stiffness: 150 },
            });
            const startX = (random(`x-${index}`) - 0.5) * 2200;
            const startY = (random(`y-${index}`) - 0.5) * 1400;
            const startRotation = (random(`r-${index}`) - 0.5) * 540;
            return (
              <div
                key={index}
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 900,
                  fontSize: 290,
                  lineHeight: 1,
                  letterSpacing: "-0.05em",
                  color: COLORS.paper,
                  transform: `translate3d(${(1 - land) * startX}px, ${(1 - land) * startY}px, 0) rotate(${(1 - land) * startRotation}deg)`,
                }}
              >
                {letter}
              </div>
            );
          })}
          <div
            style={{
              width: 64,
              height: 64,
              marginLeft: 14,
              borderRadius: "50%",
              backgroundColor: COLORS.orange,
              transform: `scale(${dotPop})`,
            }}
          />
        </div>

        <div
          style={{
            width: 1100,
            height: 4,
            marginTop: 20,
            backgroundColor: COLORS.paper,
            transform: `scaleX(${lineDraw})`,
          }}
        />
        <div
          style={{
            height: 50,
            marginTop: 28,
            fontFamily: MONO_FONT,
            fontWeight: 500,
            fontSize: 34,
            color: COLORS.paper,
          }}
        >
          {ROLE.slice(0, typedChars)}
          <span style={{ color: COLORS.orange, opacity: Math.floor(frame / 10) % 2 === 0 ? 1 : 0 }}>▌</span>
        </div>
        <div
          style={{
            marginTop: 36,
            padding: "14px 30px",
            borderRadius: 999,
            backgroundColor: COLORS.lime,
            color: COLORS.ink,
            fontFamily: MONO_FONT,
            fontWeight: 700,
            fontSize: 26,
            letterSpacing: "0.08em",
            transform: `scale(${pillPop}) rotate(${(1 - pillPop) * -8}deg)`,
          }}
        >
          SHOWREEL 2026 · 15s · 60fps · 100% code
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            backgroundColor: COLORS.orange,
            transform: `scale(${iris > 0.6 ? tween({ frame, start: 108, duration: 10 }) : 0})`,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
