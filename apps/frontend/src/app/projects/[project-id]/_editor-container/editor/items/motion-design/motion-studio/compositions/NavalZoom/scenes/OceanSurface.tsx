import { AbsoluteFill } from "remotion";
import { NAVAL_COLORS } from "../constants";

type OceanSurfaceProps = {
  frame: number;
  id: string;
  waveScale: number;
  driftSpeed: number;
};

// Sea seen from above: lit fractal noise drifting across a deep gradient, plus a sun glint.
export const OceanSurface: React.FC<OceanSurfaceProps> = ({ frame, id, waveScale, driftSpeed }) => {
  const drift = (frame * driftSpeed) % 400;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${NAVAL_COLORS.ocean} 0%, ${NAVAL_COLORS.deepOcean} 70%, #03203A 100%)` }}>
      <svg
        width={2400}
        height={1500}
        style={{ position: "absolute", left: -400 + drift, top: -300 + drift * 0.35, mixBlendMode: "soft-light", opacity: 0.9 }}
      >
        <filter id={`${id}-waves`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency={`${0.006 / waveScale} ${0.018 / waveScale}`} numOctaves={4} seed={3} />
          <feDiffuseLighting lightingColor="#ffffff" surfaceScale={3.2}>
            <feDistantLight azimuth={225} elevation={38} />
          </feDiffuseLighting>
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id}-waves)`} />
      </svg>
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse 40% 30% at 72% 26%, rgba(255,255,255,0.28), transparent 70%)",
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};
