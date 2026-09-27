import { loadFont as loadBarlowCondensed } from "@remotion/google-fonts/BarlowCondensed";
export {
  DISPLAY_FONT,
  easeInExpo,
  easeInOutQuint,
  easeOutExpo,
  MONO_FONT,
  tween,
} from "../Showreel/constants";

// Tall uppercase face for chapter titles, in the spirit of naval-group.com headings.
export const { fontFamily: TITLE_FONT } = loadBarlowCondensed("normal", {
  weights: ["600", "700"],
  subsets: ["latin", "latin-ext"],
});

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
  // Chapter title shown in the lower third, uppercase French like the naval-group.com headings.
  title: string;
  scale: string;
  from: number;
  duration: number;
  // Point of this scene the camera dives into, in 1920x1080 design space.
  focus: { x: number; y: number };
};

// Every `from` sits on the 30-frame beat grid; each scene ends ZOOM_OVERLAP frames after the next one starts.
export const ZOOM_SCENES: ZoomScene[] = [
  { id: "globe", label: "Terre", title: "La Terre · 71 % d’océans", scale: "12 742 km", from: 0, duration: 174, focus: CENTER },
  { id: "ocean", label: "Golfe de Gascogne", title: "Golfe de Gascogne", scale: "40 km", from: 150, duration: 174, focus: CENTER },
  { id: "vessel", label: "Patrouilleur", title: "Patrouilleur hauturier", scale: "90 m", from: 300, duration: 174, focus: { x: 887, y: 488 } },
  { id: "ops", label: "Central opérations", title: "Central opérations", scale: "12 m", from: 450, duration: 174, focus: { x: 960, y: 750 } },
  { id: "console", label: "Console tactique", title: "Situation tactique", scale: "60 cm", from: 600, duration: 144, focus: { x: 620, y: 590 } },
  { id: "neural", label: "Électronique · IA", title: "Électronique · IA embarquée", scale: "4 mm", from: 720, duration: 114, focus: CENTER },
  { id: "logo", label: "Naval Group", title: "", scale: "—", from: 810, duration: 90, focus: CENTER },
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
