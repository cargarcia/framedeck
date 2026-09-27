# Scene recipes

Each recipe states the hero movement, the supporting layers, and timings at 60fps. Build them as `scenes/<Name>Scene.tsx` receiving `{ frame }`.

## Continuous zoom (the NavalZoom spine)

- Hero: `ZoomLayer` dives from each scene's `focus` into the next one. Scenes overlap by `ZOOM_OVERLAP` (24 frames).
- Give every scene an amber element at its focus point so the eye is already there when the dive starts.
- The HUD zoom factor rises by ~1.5 orders of magnitude per scene; update the scale bar label per scene.

## Key figures

- Hero: one big number counting up with `tween()` (ease-out-expo, 60–80 frames), `tabular-nums`, uppercase mono unit below.
- Support: a line drawing under it, a mono caption typed in, a photo slowly pushing in behind at 30% opacity.
- Only use figures the user supplied.

## Photo hero with callouts

- Hero: full-bleed photo, Ken Burns from 1.04 to 1.0 over the scene.
- Support: tracking box corners closing in (30 frames), a scan line, 3–4 callouts staggered by ~12 frames, the last one amber and pointing at the next focus.
- Map callout anchors in photo pixel coordinates and convert with the cover scale, as `toScreen()` does in `VesselScene.tsx`.

## Chapter title card

- Hero: uppercase title revealed per letter from a mask (stagger 2 frames, 28-frame ease-out-expo).
- Support: chapter index `02 / 06` in mono, a thin cyan rule drawing from the left, background photo darkened to 25%.
- Duration 60–90 frames; cut on the beat.

## Tactical console

- Hero: radar sweep (`conic-gradient` rotated `frame * 3.2` degrees) with contacts that brighten when the sweep passes their bearing.
- Support: track table rows appearing one by one, bar meters, a waveform polyline.

## Electronics to intelligence

- Hero: PCB pads moving to neural-network node positions (`mix(pad, neuron, morph)`), traces fading as connections draw in.
- Support: activation wave travelling layer by layer (amber), then convergence into a flash that hands over to the end card.

## End card

- Light foam background, brandNavy wordmark or official logo (`logoSrc`), a navy rule drawing under it, one mono line of context.
- Hold the final frame at least 30 frames.

## Vertical format (1080x1920)

- Same scenes, recompute focus points; HUD moves to top and bottom bands; keep titles to two short lines.
