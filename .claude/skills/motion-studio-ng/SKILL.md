---
name: motion-studio-ng
description: Create Naval Group–style motion design videos (showreels, product reels, key-figure clips, continuous zooms, tactical HUD sequences) as Remotion compositions in Framedeck's motion studio, then render them to MP4 with a soundtrack. Use when the user asks for a naval, defense, maritime or Naval Group–flavoured motion design, a "motion studio NG" video, or a new scene in the NavalZoom reel.
metadata:
  tags: remotion, motion-design, naval-group, showreel, hud, zoom
---

# Motion Studio NG

Build institutional, naval-grade motion design in the spirit of naval-group.com: deep navy surfaces, full-bleed sea and ship imagery, sober uppercase typography, thin technical lines, key figures that count up, and precise, confident motion. Everything is a Remotion composition inside the Framedeck motion studio.

Read `.claude/skills/remotion-best-practices/SKILL.md` for general Remotion rules. This skill adds the NG design language, the reusable building blocks, and a render pipeline that works in this container.

## Where things live

- Motion studio root: `apps/frontend/src/app/projects/[project-id]/_editor-container/editor/items/motion-design/motion-studio/`
- Register compositions in its `Root.tsx`.
- Reference implementation: `compositions/NavalZoom/` (globe → ocean → vessel photo → ops room → console → neural net → brand). Reuse its parts before writing new ones.
- Static assets (photos, official logo files): `apps/frontend/public/motion-studio/`, loaded with `staticFile("motion-studio/<file>")`.

## Workflow

1. **Brief**: identify the story (orbit-to-detail zoom, product reveal, key figures, capability tour), duration (default 15s), format (1920x1080 @ 60fps; 1080x1920 for social), and the assets the user supplies (photos, official logo).
2. **Storyboard on a beat grid**: at 60fps, one beat = 30 frames (120 BPM). Put every cut or scene arrival on a beat. Write the scene table (id, label, from, duration, focus point) in a `constants.ts`, like `ZOOM_SCENES` in NavalZoom.
3. **Build**: one component per scene in `scenes/`, each receiving a local `frame`. Keep files under 300 lines. Use `useDesignFrame()` in the root composition so timings stay tied to 60fps.
4. **Check stills** before rendering the whole video (see [render workflow](./references/render-workflow.md)). Look at one frame per scene plus every transition frame.
5. **Render in two halves**, add the soundtrack, deliver the MP4, and publish a viewer page when the user wants to watch it.
6. Run `npx eslint <folder>` and check `npx tsc --noEmit -p apps/frontend` shows no error in the new files, then commit.

## Design language

Load [./references/design-language.md](./references/design-language.md) before designing. The short version:

- **Palette**: navy-dominant. Abyss `#020A17`, navy `#062347`, brand navy `#0B2A5B`, ocean `#0A4F7C`, sonar cyan `#3FD8FF` as the single accent, amber `#FFB547` only for the one element the viewer must follow, foam white `#E9F7FF` for text.
- **Type**: uppercase display titles with generous tracking (Inter 800–900 or Barlow Condensed 600–700); JetBrains Mono for data, coordinates, labels and HUD.
- **Imagery**: full-bleed photography of real ships and sea, graded toward navy with a vignette. Prefer the user's photos to drawn ships.
- **Lines**: 1–3px strokes, corner brackets, callout leaders with a dot anchor, dashed grids. No rounded "card" UI, no emoji, no gradients other than sea/sky and glow.
- **Tone**: factual and precise. Labels name real things (HELIDECK, MAIN GUN, 46°12′N · 006°04′W, 12 742 km), never marketing adjectives.

## Motion principles

- One idea per scene, one hero movement per scene, everything else supports it.
- Ease-out-expo for entrances, ease-in-out-quint for camera moves, ease-in for dives. Springs only for small HUD pops, with damping ≥ 12 so nothing feels playful.
- Camera moves are continuous and log-scale (see `ZoomLayer`): zoom speed feels constant from ×1 to ×10⁹.
- Reveal text with masks (translate up inside `overflow: hidden`), line draws (`scaleX`), and typewriter for mono data. No bouncing letters.
- Keep a HUD layer constant across scenes (zoom factor, real-world scale bar, coordinates, chapter index, progress line). It is the thread that makes cuts feel like one shot.
- Amber highlights exactly one thing per scene: the next focus point.

## Building blocks (in `compositions/NavalZoom/`)

| File | Use it for |
| --- | --- |
| `ZoomLayer.tsx` | Chaining scenes by diving into a focus point: log-space scale, focus drift to center, soft elliptical reveal, exit blur. |
| `NavalZoomHud.tsx` | Zoom factor, scale bar, coordinates, corner brackets, progress line, and the chapter lower third (index + Barlow Condensed title from each scene's `title`). |
| `scenes/GlobeScene.tsx` | Orthographic Earth from Natural Earth data (`land-rings.ts`), graticule, atmosphere, target marker. |
| `scenes/OceanSurface.tsx` + `Wake.tsx` | Animated sea from above and a Kelvin wake. |
| `scenes/VesselScene.tsx` | Full-bleed photo with Ken Burns, tracking box, scan line, callouts anchored in photo coordinates. |
| `scenes/OpsRoomScene.tsx`, `ConsoleScene.tsx` | Operations room plan and radar console with sweep and track table. |
| `scenes/NeuralScene.tsx` | PCB traces morphing into a neural network, then converging into a flash. |
| `scenes/LogoScene.tsx` | Closing brand lockup; pass `logoSrc` to use an official logo file. |

To add a scene to an NG video, copy the closest scene, keep its props signature `{ frame: number }`, add it to the scene table, and give it a focus point for the next dive.

More scene recipes (key figures, capability cards, chapter titles, vertical format): [./references/scene-recipes.md](./references/scene-recipes.md).

## Brand and asset rules

- Never redraw or approximate the Naval Group logo. Without the official file, close on a typographic wordmark and tell the user; with it, pass `logoSrc`.
- Ask for high-resolution photos (≥ 1920px wide). Photos under that size go soft when zoomed; say so.
- Do not invent pennant numbers, ship names, programmes or figures presented as real. Use generic labels or the user's data.
- Committing user-supplied photos or logos to the repo: mention it so the user can confirm they are allowed to store them there.

## Rendering and sound

Follow [./references/render-workflow.md](./references/render-workflow.md). It covers bundling, the Google Fonts certificate workaround, rendering in two halves (a single 900-frame render can stall), muxing, and publishing a viewer page. `scripts/render.sh <CompositionId>` automates all of it, and `scripts/soundtrack.py` generates a naval sound bed (drone, sonar pings, whooshes, pulse, brand hit) from a cue list.
