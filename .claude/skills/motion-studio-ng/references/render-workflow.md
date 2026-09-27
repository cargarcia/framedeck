# Render workflow

All commands run from the repo root. Output goes to a scratch directory, never into the repo.

## 1. Check stills

```bash
bash .claude/skills/motion-studio-ng/scripts/render.sh NavalZoom <scratch>/ng --stills 60,158,300,400,460,600,760,895
```

Read the PNGs. Check every scene and every transition frame (a scene's `from` + ~12): no hard rectangle edges, HUD not overlapping content, callout labels inside the frame, text not clipped.

## 2. Soundtrack

Write a cue file with times in seconds (scene `from / 60`), then:

```bash
python3 .claude/skills/motion-studio-ng/scripts/soundtrack.py <scratch>/cues.json <scratch>/soundtrack.wav
```

## 3. Render and mux

```bash
FRAMES=900 bash .claude/skills/motion-studio-ng/scripts/render.sh NavalZoom <scratch>/ng <scratch>/soundtrack.wav
```

Produces `<scratch>/ng/NavalZoom.mp4` (full quality) and `web.mp4` (smaller, for a viewer page). A 15s 1080p60 render takes about 5–8 minutes here.

## 4. Deliver

- Send the MP4 with `SendUserFile`.
- To let the user watch it in the browser, publish an artifact page with a `<video>` element, the web MP4 and a poster JPG passed through `files`, plus chapter buttons that seek to each scene. Republish the same file path to update it.

## Known issues in this container

- **Fonts**: headless Chrome rejects the egress proxy certificate for `fonts.gstatic.com`. `render.sh` downloads the fonts with curl and rewrites the bundle to serve them locally. Never disable TLS verification.
- **Chrome download**: Remotion cannot download its headless shell (host blocked). `render.sh` uses `/opt/pw-browsers/chromium` with `--chrome-mode=chrome-for-testing`.
- **Stalled renders**: one 900-frame render at default concurrency stalled at a frame. Rendering two halves at `--concurrency=4` works. If a render stalls, stop only the `remotion render` process and restart; do not `pkill` broad patterns (it can kill the calling shell).
- **Heavy filters**: full-screen SVG `feTurbulence` + lighting (sea surfaces) is the slowest part; avoid stacking more than one per frame.
- **External sites** (naval-group.com, jsdelivr, brand portals) are blocked. Natural Earth data came from the `world-atlas` npm package via `npm pack`.
