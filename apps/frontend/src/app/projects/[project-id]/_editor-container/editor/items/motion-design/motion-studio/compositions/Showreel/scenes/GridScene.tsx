import { AbsoluteFill, spring, useVideoConfig } from "remotion";
import { useDesignFrame } from "../../../use-design-frame";
import { COLORS, easeInExpo, MONO_FONT, PALETTE, tween } from "../constants";

const COLUMNS = 13;
const ROWS = 7;
const CELL = 150;
const TILE = 92;
const CENTER_COLUMN = (COLUMNS - 1) / 2;
const CENTER_ROW = (ROWS - 1) / 2;

export const GridScene: React.FC = () => {
  const frame = useDesignFrame();
  const { fps } = useVideoConfig();

  // The camera dives into the center tile, which becomes the next scene's backdrop.
  const dive = tween({ frame, start: 96, duration: 54, easing: easeInExpo });
  const gridRotation = tween({ frame, start: 70, duration: 80, to: 45 });
  const labelReveal = tween({ frame, start: 20, duration: 24 });

  const tiles = [];
  for (let row = 0; row < ROWS; row++) {
    for (let column = 0; column < COLUMNS; column++) {
      const distance = Math.hypot(column - CENTER_COLUMN, row - CENTER_ROW);
      const isCenter = column === CENTER_COLUMN && row === CENTER_ROW;
      const appear = spring({
        frame: frame - distance * 2.6,
        fps,
        config: { damping: 12, stiffness: 190 },
      });
      const wave = (Math.sin(frame * 0.09 - distance * 0.75) + 1) / 2;
      const colorIndex = Math.floor(frame / 12 + distance) % PALETTE.length;
      const color = isCenter && frame > 90 ? COLORS.night : PALETTE[colorIndex]!;
      const scale = appear * (isCenter ? 1 : 0.35 + wave * 0.65);

      tiles.push(
        <div
          key={`${row}-${column}`}
          style={{
            position: "absolute",
            left: column * CELL + (CELL - TILE) / 2,
            top: row * CELL + (CELL - TILE) / 2,
            width: TILE,
            height: TILE,
            backgroundColor: color,
            borderRadius: `${(isCenter ? 0 : wave) * 50}%`,
            transform: `scale(${scale}) rotate(${wave * 90 + (1 - appear) * 180}deg)`,
          }}
        />,
      );
    }
  }

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            position: "relative",
            width: COLUMNS * CELL,
            height: ROWS * CELL,
            flexShrink: 0,
            transform: `rotate(${gridRotation}deg) scale(${1 + dive * 26})`,
          }}
        >
          {tiles}
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 140,
          bottom: 130,
          fontFamily: MONO_FONT,
          fontSize: 26,
          fontWeight: 700,
          color: COLORS.paper,
          backgroundColor: COLORS.ink,
          padding: "10px 18px",
          opacity: labelReveal * (1 - dive),
          transform: `translate3d(0, ${(1 - labelReveal) * 30}px, 0)`,
        }}
      >
        {`${COLUMNS * ROWS} tiles · 1 wave function · 0 manual keyframes`}
      </div>
    </AbsoluteFill>
  );
};
