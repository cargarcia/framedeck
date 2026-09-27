import { AbsoluteFill, random } from "remotion";
import { useDesignFrame } from "../../../use-design-frame";
import { COLORS, DISPLAY_FONT, MONO_FONT, PALETTE, tween } from "../constants";

const FLOOR_Y = 780;
const DROP_HEIGHT = 640;
const BALL_SIZE = 150;
const DECAY = 2.2;
const IMPACTS = [
  { frame: 15, strength: 1 },
  { frame: 45, strength: 0.45 },
];
const PARTICLE_COUNT = 34;
const GRAVITY = 2600;

// Damped bounce: |cos| gives the arcs, the exponential shrinks each hop.
function calculateBallHeight(frame: number): number {
  const seconds = frame / 60;
  return DROP_HEIGHT * Math.exp(-DECAY * seconds) * Math.abs(Math.cos(2 * Math.PI * seconds));
}

export const PhysicsScene: React.FC = () => {
  const frame = useDesignFrame();

  const height = calculateBallHeight(frame);
  const velocity = Math.abs(calculateBallHeight(frame + 1) - height);
  const envelope = Math.exp(-DECAY * (frame / 60));
  const groundProximity = Math.max(0, 1 - height / 50);
  const squash = groundProximity * envelope;
  // Stretch in the air, but hand over to squash on contact.
  const stretch = Math.min(velocity / 60, 0.35) * (1 - groundProximity);
  const scaleX = 1 - stretch * 0.45 + squash * 0.55;
  const scaleY = 1 + stretch - squash * 0.45;

  const shake = IMPACTS.reduce((amount, impact) => {
    const since = frame - impact.frame;
    if (since < 0 || since > 10) return amount;
    return amount + (1 - since / 10) * 22 * impact.strength;
  }, 0);
  const shakeX = (random(`shake-x-${Math.floor(frame)}`) - 0.5) * shake;
  const shakeY = (random(`shake-y-${Math.floor(frame)}`) - 0.5) * shake;
  const titleReveal = tween({ frame, start: 0, duration: 20 });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate3d(${shakeX}px, ${shakeY}px, 0)` }}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 900,
              fontSize: 330,
              letterSpacing: `${0.3 - titleReveal * 0.34}em`,
              color: "transparent",
              WebkitTextStroke: `2px rgba(243,240,232,0.35)`,
              transform: "translate3d(0, -90px, 0)",
            }}
          >
            PHYSICS
          </div>
        </AbsoluteFill>

        <div
          style={{
            position: "absolute",
            left: 260,
            right: 260,
            top: FLOOR_Y,
            height: 2,
            backgroundColor: "rgba(243,240,232,0.3)",
          }}
        />

        {IMPACTS.map((impact) => {
          const since = (frame - impact.frame) / 60;
          if (since < 0) return null;
          const ring = tween({ frame: frame - impact.frame, start: 0, duration: 24 });
          return (
            <div key={impact.frame}>
              <div
                style={{
                  position: "absolute",
                  left: 960 - 300,
                  top: FLOOR_Y - 40,
                  width: 600,
                  height: 80,
                  borderRadius: "50%",
                  border: `4px solid ${COLORS.orange}`,
                  opacity: (1 - ring) * impact.strength,
                  transform: `scale(${0.2 + ring * 1.6 * impact.strength})`,
                }}
              />
              {Array.from({ length: PARTICLE_COUNT }, (_, index) => {
                const seed = `${impact.frame}-${index}`;
                const angle = Math.PI * (0.08 + random(`angle-${seed}`) * 0.84);
                const speed = (700 + random(`speed-${seed}`) * 1300) * impact.strength;
                const size = 6 + random(`size-${seed}`) * 16;
                const x = 960 + Math.cos(angle) * speed * since;
                const y = FLOOR_Y - Math.sin(angle) * speed * since + 0.5 * GRAVITY * since * since;
                const isSquare = index % 3 === 0;
                return (
                  <div
                    key={seed}
                    style={{
                      position: "absolute",
                      left: x - size / 2,
                      top: y - size / 2,
                      width: size,
                      height: size,
                      borderRadius: isSquare ? 2 : "50%",
                      backgroundColor: PALETTE[index % PALETTE.length],
                      opacity: Math.max(0, 1 - since * 1.6),
                      transform: `rotate(${since * 900 * (index % 2 === 0 ? 1 : -1)}deg)`,
                    }}
                  />
                );
              })}
            </div>
          );
        })}

        {[3, 2, 1, 0].map((ghost) => {
          const ghostHeight = calculateBallHeight(Math.max(0, frame - ghost * 1.5));
          return (
            <div
              key={ghost}
              style={{
                position: "absolute",
                left: 960 - BALL_SIZE / 2,
                top: FLOOR_Y - BALL_SIZE - ghostHeight,
                width: BALL_SIZE,
                height: BALL_SIZE,
                borderRadius: "50%",
                backgroundColor: COLORS.orange,
                opacity: ghost === 0 ? 1 : 0.18 / ghost,
                transformOrigin: "50% 100%",
                transform: ghost === 0 ? `scale(${scaleX}, ${scaleY})` : undefined,
              }}
            />
          );
        })}
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          left: 140,
          bottom: 130,
          fontFamily: MONO_FONT,
          fontWeight: 700,
          fontSize: 26,
          color: COLORS.paper,
          opacity: titleReveal,
        }}
      >
        squash · stretch · gravity · follow-through
      </div>
    </AbsoluteFill>
  );
};
