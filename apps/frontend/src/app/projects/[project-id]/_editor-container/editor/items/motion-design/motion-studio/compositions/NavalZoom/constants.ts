export {
  DISPLAY_FONT,
  easeInExpo,
  easeInOutQuint,
  easeOutExpo,
  MONO_FONT,
  tween,
} from "../Showreel/constants";

export const NAVAL_ZOOM_FPS = 60;
export const NAVAL_ZOOM_WIDTH = 1920;
export const NAVAL_ZOOM_HEIGHT = 1080;
export const NAVAL_ZOOM_DURATION = 900; // 15s @ 60fps

// Frames during which two consecutive scenes are both on screen.
export const ZOOM_OVERLAP = 24;

export const CENTER = { x: NAVAL_ZOOM_WIDTH / 2, y: NAVAL_ZOOM_HEIGHT / 2 };

export type ZoomSceneId = "globe" | "ocean" | "vessel" | "ops" | "console" | "neural" | "logo";

type ZoomScene = {
  id: ZoomSceneId;
  label: string;
  scale: string;
  from: number;
  duration: number;
  // Point of this scene the camera dives into, in 1920x1080 design space.
  focus: { x: number; y: number };
};

export const ZOOM_SCENES: ZoomScene[] = [
  { id: "globe", label: "Earth", scale: "12 742 km", from: 0, duration: 170, focus: CENTER },
  { id: "ocean", label: "Bay of Biscay", scale: "40 km", from: 146, duration: 174, focus: CENTER },
  { id: "vessel", label: "Offshore patrol vessel", scale: "90 m", from: 296, duration: 174, focus: { x: 920, y: 546 } },
  { id: "ops", label: "Operations center", scale: "12 m", from: 446, duration: 174, focus: { x: 960, y: 750 } },
  { id: "console", label: "Tactical console", scale: "60 cm", from: 596, duration: 144, focus: { x: 620, y: 590 } },
  { id: "neural", label: "Electronics · neural core", scale: "4 mm", from: 716, duration: 124, focus: CENTER },
  { id: "logo", label: "Naval Group", scale: "—", from: 816, duration: 84, focus: CENTER },
];

export const NAVAL_COLORS = {
  abyss: "#020A17",
  navy: "#062347",
  ocean: "#0A4F7C",
  deepOcean: "#05304F",
  cyan: "#3FD8FF",
  foam: "#E9F7FF",
  amber: "#FFB547",
  steel: "#9CA8B4",
  steelDark: "#5F6B77",
  board: "#041A24",
} as const;

// Target on the globe: Bay of Biscay, off the French Atlantic coast.
export const TARGET = { longitude: -6.07, latitude: 46.2 };
