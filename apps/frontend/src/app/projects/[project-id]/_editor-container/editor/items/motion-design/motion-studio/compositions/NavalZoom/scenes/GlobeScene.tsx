import { AbsoluteFill, random } from "remotion";
import { CENTER, easeInOutQuint, MONO_FONT, NAVAL_COLORS, TARGET, tween } from "../constants";
import { LAND_RINGS } from "../land-rings";

const RADIUS = 400;
const DEG = Math.PI / 180;
const STAR_COUNT = 160;

type ProjectionParams = { longitude: number; latitude: number; centerLongitude: number; centerLatitude: number };

// Orthographic projection; points on the far side are pushed onto the limb so rings stay closed.
function projectPoint({ longitude, latitude, centerLongitude, centerLatitude }: ProjectionParams) {
  const lambda = (longitude - centerLongitude) * DEG;
  const phi = latitude * DEG;
  const phi0 = centerLatitude * DEG;
  const x = Math.cos(phi) * Math.sin(lambda);
  const y = Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * Math.cos(phi) * Math.cos(lambda);
  const depth = Math.sin(phi0) * Math.sin(phi) + Math.cos(phi0) * Math.cos(phi) * Math.cos(lambda);
  if (depth >= 0) return { x: CENTER.x + x * RADIUS, y: CENTER.y - y * RADIUS, isVisible: true };
  const length = Math.hypot(x, y) || 1;
  return { x: CENTER.x + (x / length) * RADIUS, y: CENTER.y - (y / length) * RADIUS, isVisible: false };
}

function buildLandPath(centerLongitude: number, centerLatitude: number): string {
  let path = "";
  for (const ring of LAND_RINGS) {
    let ringPath = "";
    let hasVisiblePoint = false;
    for (let index = 0; index < ring.length; index += 2) {
      const point = projectPoint({ longitude: ring[index]!, latitude: ring[index + 1]!, centerLongitude, centerLatitude });
      hasVisiblePoint ||= point.isVisible;
      ringPath += `${index === 0 ? "M" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`;
    }
    if (hasVisiblePoint) path += `${ringPath}Z`;
  }
  return path;
}

function buildGraticulePath(centerLongitude: number, centerLatitude: number): string {
  let path = "";
  const addLine = (points: Array<[number, number]>) => {
    let isDrawing = false;
    for (const [longitude, latitude] of points) {
      const point = projectPoint({ longitude, latitude, centerLongitude, centerLatitude });
      if (!point.isVisible) {
        isDrawing = false;
        continue;
      }
      path += `${isDrawing ? "L" : "M"}${point.x.toFixed(1)},${point.y.toFixed(1)}`;
      isDrawing = true;
    }
  };
  for (let longitude = -180; longitude < 180; longitude += 20) {
    addLine(Array.from({ length: 61 }, (_, index) => [longitude, -90 + index * 3] as [number, number]));
  }
  for (let latitude = -60; latitude <= 60; latitude += 20) {
    addLine(Array.from({ length: 121 }, (_, index) => [-180 + index * 3, latitude] as [number, number]));
  }
  return path;
}

export const GlobeScene: React.FC<{ frame: number }> = ({ frame }) => {
  const turn = tween({ frame, start: 0, duration: 130, easing: easeInOutQuint });
  const centerLongitude = -95 + (TARGET.longitude + 95) * turn;
  const centerLatitude = 12 + (TARGET.latitude - 12) * turn;
  const globeIn = tween({ frame, start: 0, duration: 50 });
  const markerIn = tween({ frame, start: 96, duration: 24 });
  const orbitAngle = frame * 0.9;
  const target = projectPoint({ ...TARGET, centerLongitude, centerLatitude });

  return (
    <AbsoluteFill style={{ backgroundColor: NAVAL_COLORS.abyss }}>
      {Array.from({ length: STAR_COUNT }, (_, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: random(`star-x-${index}`) * 1920,
            top: random(`star-y-${index}`) * 1080,
            width: 1 + random(`star-s-${index}`) * 2.5,
            height: 1 + random(`star-s-${index}`) * 2.5,
            borderRadius: "50%",
            backgroundColor: NAVAL_COLORS.foam,
            opacity: 0.25 + 0.55 * Math.abs(Math.sin(frame / 24 + index)),
          }}
        />
      ))}

      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: globeIn }}>
        <defs>
          <radialGradient id="globe-ocean" cx="40%" cy="35%" r="75%">
            <stop offset="0%" stopColor="#1273A8" />
            <stop offset="55%" stopColor={NAVAL_COLORS.deepOcean} />
            <stop offset="100%" stopColor="#010B18" />
          </radialGradient>
          <radialGradient id="globe-atmosphere" cx="50%" cy="50%" r="50%">
            <stop offset="86%" stopColor={NAVAL_COLORS.cyan} stopOpacity={0} />
            <stop offset="90%" stopColor={NAVAL_COLORS.cyan} stopOpacity={0.45} />
            <stop offset="100%" stopColor={NAVAL_COLORS.cyan} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="globe-shade" cx="30%" cy="28%" r="85%">
            <stop offset="45%" stopColor="#000" stopOpacity={0} />
            <stop offset="100%" stopColor="#000" stopOpacity={0.65} />
          </radialGradient>
          <clipPath id="globe-clip">
            <circle cx={CENTER.x} cy={CENTER.y} r={RADIUS} />
          </clipPath>
        </defs>
        <circle cx={CENTER.x} cy={CENTER.y} r={RADIUS * 1.16} fill="url(#globe-atmosphere)" />
        <circle cx={CENTER.x} cy={CENTER.y} r={RADIUS} fill="url(#globe-ocean)" />
        <g clipPath="url(#globe-clip)">
          <path d={buildGraticulePath(centerLongitude, centerLatitude)} fill="none" stroke={NAVAL_COLORS.cyan} strokeOpacity={0.18} strokeWidth={1} />
          <path
            d={buildLandPath(centerLongitude, centerLatitude)}
            fill="#1C4A63"
            fillRule="evenodd"
            stroke={NAVAL_COLORS.cyan}
            strokeOpacity={0.7}
            strokeWidth={1.2}
          />
          <circle cx={CENTER.x} cy={CENTER.y} r={RADIUS} fill="url(#globe-shade)" />
        </g>

        <ellipse
          cx={CENTER.x}
          cy={CENTER.y}
          rx={RADIUS * 1.42}
          ry={RADIUS * 0.34}
          fill="none"
          stroke={NAVAL_COLORS.foam}
          strokeOpacity={0.22}
          strokeDasharray="4 10"
          transform={`rotate(-18 ${CENTER.x} ${CENTER.y})`}
        />
        <circle
          cx={CENTER.x + Math.cos(orbitAngle * DEG) * RADIUS * 1.42}
          cy={CENTER.y + Math.sin(orbitAngle * DEG) * RADIUS * 0.34}
          r={5}
          fill={NAVAL_COLORS.foam}
          transform={`rotate(-18 ${CENTER.x} ${CENTER.y})`}
          opacity={Math.sin(orbitAngle * DEG) > -0.2 ? 1 : 0.2}
        />

        {target.isVisible && (
          <g opacity={markerIn}>
            {[0, 1].map((ring) => {
              const pulse = ((frame + ring * 20) % 40) / 40;
              return (
                <circle
                  key={ring}
                  cx={target.x}
                  cy={target.y}
                  r={8 + pulse * 34}
                  fill="none"
                  stroke={NAVAL_COLORS.amber}
                  strokeWidth={2}
                  opacity={1 - pulse}
                />
              );
            })}
            <circle cx={target.x} cy={target.y} r={5} fill={NAVAL_COLORS.amber} />
            <line x1={target.x + 10} y1={target.y - 10} x2={target.x + 80} y2={target.y - 80} stroke={NAVAL_COLORS.amber} strokeWidth={1.5} />
          </g>
        )}
      </svg>

      <div
        style={{
          position: "absolute",
          left: target.x + 88,
          top: target.y - 104,
          fontFamily: MONO_FONT,
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: "0.12em",
          color: NAVAL_COLORS.amber,
          opacity: target.isVisible ? markerIn : 0,
          whiteSpace: "nowrap",
        }}
      >
        GOLFE DE GASCOGNE
        <div style={{ color: NAVAL_COLORS.foam, opacity: 0.7, fontWeight: 500 }}>46°12′N · 006°04′W</div>
      </div>
    </AbsoluteFill>
  );
};
