import { AbsoluteFill, Img, spring, staticFile, useVideoConfig } from "remotion";
import { DISPLAY_FONT, MONO_FONT, NAVAL_COLORS, tween } from "../constants";

const WORDMARK = "NAVAL GROUP";
const BRAND_NAVY = "#0B2A5B";

type LogoSceneProps = {
  frame: number;
  // Official logo file in the public folder; without it a typographic wordmark stands in.
  logoSrc?: string;
};

export const LogoScene: React.FC<LogoSceneProps> = ({ frame, logoSrc }) => {
  const { fps } = useVideoConfig();
  const lineDraw = tween({ frame, start: 26, duration: 30 });
  const captionIn = tween({ frame, start: 40, duration: 24 });
  const sweep = tween({ frame, start: 30, duration: 36 });
  const logoPop = spring({ frame: frame - 6, fps, config: { damping: 16, stiffness: 120 } });

  return (
    <AbsoluteFill style={{ backgroundColor: NAVAL_COLORS.foam, alignItems: "center", justifyContent: "center" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, #FFFFFF 0%, ${NAVAL_COLORS.foam} 45%, #CFE3F0 100%)` }} />

      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        {logoSrc ? (
          <Img src={staticFile(logoSrc)} style={{ height: 260, transform: `scale(${0.85 + logoPop * 0.15})`, opacity: logoPop }} />
        ) : (
          <div style={{ position: "relative", display: "flex", overflow: "hidden", padding: "0 10px" }}>
            {WORDMARK.split("").map((letter, index) => {
              const rise = tween({ frame, start: 4 + index * 2.2, duration: 30 });
              return (
                <div
                  key={index}
                  style={{
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 900,
                    fontSize: 170,
                    letterSpacing: "0.06em",
                    lineHeight: 1.05,
                    color: BRAND_NAVY,
                    whiteSpace: "pre",
                    transform: `translate3d(0, ${(1 - rise) * 110}%, 0)`,
                  }}
                >
                  {letter}
                </div>
              );
            })}
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: 180,
                left: `${-20 + sweep * 130}%`,
                background: "linear-gradient(90deg, transparent, rgba(63,216,255,0.55), transparent)",
                mixBlendMode: "screen",
                transform: "skewX(-18deg)",
              }}
            />
          </div>
        )}
        <div style={{ width: 1180, height: 4, backgroundColor: BRAND_NAVY, transform: `scaleX(${lineDraw})` }} />
        <div
          style={{
            fontFamily: MONO_FONT,
            fontWeight: 700,
            fontSize: 24,
            letterSpacing: "0.32em",
            color: BRAND_NAVY,
            opacity: captionIn,
            transform: `translate3d(0, ${(1 - captionIn) * 16}px, 0)`,
          }}
        >
          FROM ORBIT TO ALGORITHM
        </div>
      </div>
    </AbsoluteFill>
  );
};
