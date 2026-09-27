import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { Easing, interpolate } from "remotion";

export const SHOWREEL_FPS = 60;
export const SHOWREEL_WIDTH = 1920;
export const SHOWREEL_HEIGHT = 1080;
export const SHOWREEL_DURATION = 900; // 15s @ 60fps

// 120 BPM grid: one beat every 30 frames, every cut lands on a beat.
export const BEAT = 30;

export const SCENES = [
  { id: "intro", label: "Opening", from: 0, duration: 120 },
  { id: "type", label: "Kinetic type", from: 120, duration: 180 },
  { id: "grid", label: "Systems", from: 300, duration: 150 },
  { id: "depth", label: "Camera & depth", from: 450, duration: 150 },
  { id: "data", label: "Data story", from: 600, duration: 120 },
  { id: "physics", label: "Physics", from: 720, duration: 60 },
  { id: "outro", label: "Signature", from: 780, duration: 120 },
] as const;

export const COLORS = {
  ink: "#08080B",
  paper: "#F3F0E8",
  orange: "#FF4D1C",
  blue: "#2F4BFF",
  lime: "#D4FF3A",
  night: "#0A0B1F",
} as const;

export const PALETTE = [COLORS.orange, COLORS.blue, COLORS.lime, COLORS.paper];

export const { fontFamily: DISPLAY_FONT } = loadInter("normal", {
  weights: ["500", "800", "900"],
  subsets: ["latin"],
});
export const { fontFamily: MONO_FONT } = loadMono("normal", {
  weights: ["500", "700"],
  subsets: ["latin"],
});

export const easeOutExpo = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOutQuint = Easing.bezier(0.83, 0, 0.17, 1);
export const easeInExpo = Easing.bezier(0.7, 0, 0.84, 0);

type TweenParams = {
  frame: number;
  start: number;
  duration: number;
  from?: number;
  to?: number;
  easing?: (input: number) => number;
};

// Clamped tween with an expo-out default, the workhorse of every scene.
export function tween({
  frame,
  start,
  duration,
  from = 0,
  to = 1,
  easing = easeOutExpo,
}: TweenParams): number {
  return interpolate(frame, [start, start + duration], [from, to], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}
