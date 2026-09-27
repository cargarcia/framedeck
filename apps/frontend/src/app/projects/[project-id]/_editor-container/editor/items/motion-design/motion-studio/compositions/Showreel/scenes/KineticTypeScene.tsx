import { AbsoluteFill, spring, useVideoConfig } from "remotion";
import { useDesignFrame } from "../../../use-design-frame";
import { COLORS, DISPLAY_FONT, MONO_FONT, tween } from "../constants";

const WORD_DURATION = 45;

const WORDS = [
  { text: "TIMING", background: COLORS.paper, color: COLORS.ink, note: "ease-out-expo · mask" },
  { text: "SPACING", background: COLORS.ink, color: COLORS.paper, note: "tracking · blur" },
  { text: "RHYTHM", background: COLORS.orange, color: COLORS.ink, note: "spring(damping: 11)" },
  { text: "EMOTION.", background: COLORS.blue, color: COLORS.paper, note: "scale · echo" },
];

const wordStyle = (color: string): React.CSSProperties => ({
  fontFamily: DISPLAY_FONT,
  fontWeight: 900,
  fontSize: 270,
  lineHeight: 1,
  letterSpacing: "-0.045em",
  color,
  whiteSpace: "nowrap",
});

type WordProps = { frame: number; text: string; color: string };

const MaskRevealWord: React.FC<WordProps> = ({ frame, text, color }) => {
  const barIn = tween({ frame, start: 0, duration: 12 });
  const barOut = tween({ frame, start: 12, duration: 14 });
  return (
    <div style={{ position: "relative", display: "flex" }}>
      <div
        style={{
          position: "absolute",
          inset: "30% -40px",
          backgroundColor: COLORS.orange,
          transformOrigin: barOut > 0 ? "right" : "left",
          transform: `scaleX(${barIn - barOut})`,
        }}
      />
      {text.split("").map((letter, index) => {
        const enter = tween({ frame, start: 8 + index * 2, duration: 22 });
        return (
          <div key={index} style={{ overflow: "hidden" }}>
            <div
              style={{
                ...wordStyle(color),
                transform: `translate3d(0, ${(1 - enter) * 105}%, 0)`,
              }}
            >
              {letter}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TrackingWord: React.FC<WordProps> = ({ frame, text, color }) => {
  const progress = tween({ frame, start: 0, duration: 34 });
  return (
    <div
      style={{
        ...wordStyle(color),
        letterSpacing: `${1.1 - progress * 1.145}em`,
        filter: `blur(${(1 - progress) * 24}px)`,
        opacity: 0.2 + progress * 0.8,
        transform: `scaleY(${1.6 - progress * 0.6})`,
      }}
    >
      {text}
    </div>
  );
};

const SpringWord: React.FC<WordProps & { fps: number }> = ({ frame, text, color, fps }) => (
  <div style={{ display: "flex" }}>
    {text.split("").map((letter, index) => {
      const bounce = spring({
        frame: frame - index * 3,
        fps,
        config: { damping: 11, stiffness: 170 },
      });
      const direction = index % 2 === 0 ? -1 : 1;
      return (
        <div
          key={index}
          style={{
            ...wordStyle(color),
            transform: `translate3d(0, ${(1 - bounce) * 520 * direction}px, 0) rotate(${(1 - bounce) * 40 * direction}deg)`,
          }}
        >
          {letter}
        </div>
      );
    })}
  </div>
);

const EchoWord: React.FC<WordProps> = ({ frame, text, color }) => (
  <div style={{ position: "relative" }}>
    {[3, 2, 1].map((echo) => {
      const scale = tween({ frame, start: echo * 3, duration: 28, from: 7, to: 1 + echo * 0.12 });
      return (
        <div
          key={echo}
          style={{
            ...wordStyle("transparent"),
            position: "absolute",
            inset: 0,
            WebkitTextStroke: `3px ${COLORS.lime}`,
            opacity: 0.8 - echo * 0.2,
            transform: `scale(${scale})`,
          }}
        >
          {text}
        </div>
      );
    })}
    <div
      style={{
        ...wordStyle(color),
        transform: `scale(${tween({ frame, start: 0, duration: 26, from: 7, to: 1 })})`,
      }}
    >
      {text}
    </div>
  </div>
);

export const KineticTypeScene: React.FC = () => {
  const frame = useDesignFrame();
  const { fps } = useVideoConfig();
  const wordIndex = Math.min(Math.floor(frame / WORD_DURATION), WORDS.length - 1);
  const wordFrame = frame - wordIndex * WORD_DURATION;
  const word = WORDS[wordIndex]!;
  const noteReveal = tween({ frame: wordFrame, start: 10, duration: 16 });
  const sceneProgress = frame / (WORD_DURATION * WORDS.length);

  const wordProps = { frame: wordFrame, text: word.text, color: word.color };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: word.background,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {wordIndex === 0 && <MaskRevealWord {...wordProps} />}
      {wordIndex === 1 && <TrackingWord {...wordProps} />}
      {wordIndex === 2 && <SpringWord {...wordProps} fps={fps} />}
      {wordIndex === 3 && <EchoWord {...wordProps} />}

      <div
        style={{
          position: "absolute",
          left: 140,
          bottom: 190,
          display: "flex",
          alignItems: "center",
          gap: 20,
          fontFamily: MONO_FONT,
          fontSize: 26,
          fontWeight: 700,
          color: word.color,
          opacity: noteReveal,
          transform: `translate3d(${(1 - noteReveal) * -40}px, 0, 0)`,
        }}
      >
        <span>{`0${wordIndex + 1}/04`}</span>
        <div style={{ width: 60, height: 3, backgroundColor: word.color }} />
        <span style={{ opacity: 0.7 }}>{word.note}</span>
      </div>
      <div
        style={{
          position: "absolute",
          right: 140,
          bottom: 200,
          width: 360,
          height: 6,
          backgroundColor: word.color,
          opacity: 0.2,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 140,
          bottom: 200,
          width: 360,
          height: 6,
          backgroundColor: word.color,
          transformOrigin: "left",
          transform: `scaleX(${sceneProgress})`,
        }}
      />
    </AbsoluteFill>
  );
};
