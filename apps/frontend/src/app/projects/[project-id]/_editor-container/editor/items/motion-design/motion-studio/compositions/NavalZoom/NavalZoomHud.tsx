import { AbsoluteFill } from "remotion";
import { easeInExpo, MONO_FONT, NAVAL_COLORS, TITLE_FONT, tween, ZOOM_OVERLAP, ZOOM_SCENES } from "./constants";

// Order of magnitude reached at the end of each scene, from orbit (10^0) to silicon (10^9).
const MAGNITUDE_PER_SCENE = 1.5;
const MARGIN = 72;
const BRACKET = 34;

const Brackets: React.FC = () => (
  <>
    {(["top", "bottom"] as const).flatMap((vertical) =>
      (["left", "right"] as const).map((horizontal) => (
        <div
          key={`${vertical}-${horizontal}`}
          style={{
            position: "absolute",
            [vertical]: MARGIN - 36,
            [horizontal]: MARGIN - 36,
            width: BRACKET,
            height: BRACKET,
            [`border${vertical === "top" ? "Top" : "Bottom"}`]: `2px solid ${NAVAL_COLORS.foam}`,
            [`border${horizontal === "left" ? "Left" : "Right"}`]: `2px solid ${NAVAL_COLORS.foam}`,
            opacity: 0.6,
          }}
        />
      )),
    )}
  </>
);

type ChapterTitleProps = { frame: number; sceneIndex: number };

// Lower third: chapter index, uppercase title revealed from a mask, cyan rule drawn from the left.
const ChapterTitle: React.FC<ChapterTitleProps> = ({ frame, sceneIndex }) => {
  const scene = ZOOM_SCENES[sceneIndex]!;
  if (!scene.title) return null;
  const localFrame = frame - scene.from;
  const reveal = tween({ frame: localFrame, start: ZOOM_OVERLAP - 6, duration: 28 });
  const exit = tween({ frame: localFrame, start: scene.duration - ZOOM_OVERLAP - 26, duration: 16, easing: easeInExpo });
  const rule = tween({ frame: localFrame, start: ZOOM_OVERLAP, duration: 36 });

  return (
    <div style={{ position: "absolute", left: MARGIN, bottom: 64, display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          fontFamily: MONO_FONT,
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: "0.24em",
          color: NAVAL_COLORS.cyan,
          opacity: reveal * (1 - exit),
        }}
      >
        {`${String(sceneIndex + 1).padStart(2, "0")} / ${String(ZOOM_SCENES.length - 1).padStart(2, "0")}`}
      </div>
      <div style={{ overflow: "hidden" }}>
        <div
          style={{
            fontFamily: TITLE_FONT,
            fontWeight: 700,
            fontSize: 72,
            lineHeight: 1,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: NAVAL_COLORS.foam,
            whiteSpace: "nowrap",
            transform: `translate3d(0, ${(1 - reveal) * 105 - exit * 105}%, 0)`,
          }}
        >
          {scene.title}
        </div>
      </div>
      <div style={{ width: 420, height: 2, backgroundColor: NAVAL_COLORS.cyan, transformOrigin: "left", transform: `scaleX(${rule * (1 - exit)})` }} />
    </div>
  );
};

export const NavalZoomHud: React.FC<{ frame: number }> = ({ frame }) => {
  const sceneIndex = Math.max(
    0,
    ZOOM_SCENES.findLastIndex((scene) => frame >= scene.from),
  );
  const scene = ZOOM_SCENES[sceneIndex]!;
  const sceneProgress = Math.min(1, (frame - scene.from) / scene.duration);
  const magnitude = Math.min(9, (sceneIndex + sceneProgress) * MAGNITUDE_PER_SCENE);
  const magnification = Math.round(10 ** magnitude).toLocaleString("fr-FR");
  const hudIn = tween({ frame, start: 8, duration: 30 });
  const hudOut = 1 - tween({ frame, start: ZOOM_SCENES[ZOOM_SCENES.length - 1]!.from, duration: 20 });
  // Titles of consecutive scenes overlap during the dive; show the incoming one once it takes over.
  const titleSceneIndex = sceneIndex > 0 && frame - scene.from < ZOOM_OVERLAP / 2 ? sceneIndex - 1 : sceneIndex;

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
      <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 72%, rgba(2,10,23,0.75) 100%)" }} />
      <Brackets />
      <div style={{ ...textStyle, top: 56, left: MARGIN }}>
        <div style={{ color: NAVAL_COLORS.cyan }}>ZOOM ×{magnification}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10, fontWeight: 500 }}>
          <div style={{ width: 120, height: 8, borderLeft: "2px solid", borderRight: "2px solid", borderBottom: "2px solid", borderColor: NAVAL_COLORS.foam }} />
          {scene.scale}
        </div>
      </div>
      <div style={{ ...textStyle, top: 56, right: MARGIN, textAlign: "right" }}>
        46°12′N · 006°04′W
        <div style={{ fontWeight: 500, opacity: 0.7, marginTop: 10 }}>{scene.label.toUpperCase()}</div>
      </div>
      <ChapterTitle frame={frame} sceneIndex={titleSceneIndex} />
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          right: MARGIN,
          bottom: 36,
          height: 2,
          backgroundColor: NAVAL_COLORS.foam,
          opacity: 0.2,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          right: MARGIN,
          bottom: 36,
          height: 2,
          backgroundColor: NAVAL_COLORS.cyan,
          transformOrigin: "left",
          transform: `scaleX(${frame / 900})`,
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
