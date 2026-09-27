import { AbsoluteFill } from "remotion";
import { MONO_FONT, NAVAL_COLORS, tween, ZOOM_SCENES } from "./constants";

// Order of magnitude reached at the end of each scene, from orbit (10^0) to silicon (10^9).
const MAGNITUDE_PER_SCENE = 1.5;

export const NavalZoomHud: React.FC<{ frame: number }> = ({ frame }) => {
  const sceneIndex = Math.max(
    0,
    ZOOM_SCENES.findLastIndex((scene) => frame >= scene.from),
  );
  const scene = ZOOM_SCENES[sceneIndex]!;
  const sceneProgress = Math.min(1, (frame - scene.from) / scene.duration);
  const magnitude = Math.min(9, (sceneIndex + sceneProgress) * MAGNITUDE_PER_SCENE);
  const magnification = Math.round(10 ** magnitude).toLocaleString("en-US");
  const hudIn = tween({ frame, start: 8, duration: 30 });
  const hudOut = 1 - tween({ frame, start: ZOOM_SCENES[ZOOM_SCENES.length - 1]!.from, duration: 20 });
  const labelIn = tween({ frame: frame - scene.from, start: 6, duration: 18 });

  const textStyle: React.CSSProperties = {
    position: "absolute",
    fontFamily: MONO_FONT,
    fontWeight: 700,
    fontSize: 19,
    letterSpacing: "0.14em",
    color: NAVAL_COLORS.foam,
    fontVariantNumeric: "tabular-nums",
  };

  return (
    <AbsoluteFill style={{ opacity: hudIn * hudOut, textShadow: "0 0 12px rgba(0,0,0,0.6)" }}>
      <div style={{ ...textStyle, top: 56, left: 72 }}>
        <div style={{ color: NAVAL_COLORS.cyan }}>ZOOM ×{magnification}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10, fontWeight: 500 }}>
          <div style={{ width: 120, height: 8, borderLeft: "2px solid", borderRight: "2px solid", borderBottom: "2px solid", borderColor: NAVAL_COLORS.foam }} />
          {scene.scale}
        </div>
      </div>
      <div style={{ ...textStyle, top: 56, right: 72, textAlign: "right" }}>
        46°12′N · 006°04′W
        <div style={{ fontWeight: 500, opacity: 0.7, marginTop: 10 }}>BAY OF BISCAY</div>
      </div>
      <div style={{ ...textStyle, bottom: 56, left: 72, overflow: "hidden" }}>
        <div style={{ transform: `translate3d(0, ${(1 - labelIn) * 100}%, 0)` }}>
          {`${String(sceneIndex + 1).padStart(2, "0")} / ${String(ZOOM_SCENES.length).padStart(2, "0")} — ${scene.label.toUpperCase()}`}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 72,
          right: 72,
          bottom: 36,
          height: 2,
          backgroundColor: NAVAL_COLORS.cyan,
          transformOrigin: "left",
          transform: `scaleX(${frame / 900})`,
          opacity: 0.8,
        }}
      />
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 40, height: 40, marginLeft: -20, marginTop: -20, opacity: 0.35 }}>
        <div style={{ position: "absolute", left: 19, top: 0, width: 2, height: 12, backgroundColor: NAVAL_COLORS.foam }} />
        <div style={{ position: "absolute", left: 19, bottom: 0, width: 2, height: 12, backgroundColor: NAVAL_COLORS.foam }} />
        <div style={{ position: "absolute", top: 19, left: 0, height: 2, width: 12, backgroundColor: NAVAL_COLORS.foam }} />
        <div style={{ position: "absolute", top: 19, right: 0, height: 2, width: 12, backgroundColor: NAVAL_COLORS.foam }} />
      </div>
    </AbsoluteFill>
  );
};
