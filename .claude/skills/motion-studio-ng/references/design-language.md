# NG design language

An interpretation of the naval-group.com look for motion design. The site itself could not be inspected from this environment, so treat the hex values as working tokens: when the user provides the official brand guide or logo files, their values win.

## Colors

| Token | Hex | Role |
| --- | --- | --- |
| abyss | `#020A17` | Default background, space, night sea |
| navy | `#062347` | Panels, gradients, ops rooms |
| brandNavy | `#0B2A5B` | Wordmarks and titles on light backgrounds |
| ocean | `#0A4F7C` | Sea surfaces, globe oceans |
| deepOcean | `#05304F` | Sea shadows |
| cyan | `#3FD8FF` | The only accent: lines, HUD, active states, glows |
| amber | `#FFB547` | One element per scene the eye must follow; threat/unknown tracks |
| foam | `#E9F7FF` | Text on dark, wakes, flashes, light end cards |
| steel | `#9CA8B4` | Hulls and hardware |

The existing `NAVAL_COLORS` object in `compositions/NavalZoom/constants.ts` holds these values; import it instead of redefining them.

Rules:
- Dark scenes are ~80% abyss/navy, ~15% imagery, ≤5% cyan. Light end cards are foam with brandNavy type.
- Grade photos toward navy: a radial vignette `rgba(2,10,23,0.7)` at the edges plus a light navy linear wash.
- Red appears only as a hostile track or an alert, never as decoration.

## Typography

- **Display**: uppercase, weight 800–900, tracking `0.04–0.08em`, one line whenever possible. Inter is already loaded (`DISPLAY_FONT`); Barlow Condensed (`@remotion/google-fonts/BarlowCondensed`) suits tall, technical titles.
- **Data / HUD**: JetBrains Mono (`MONO_FONT`) 16–24px at 1080p, weight 500–700, tracking `0.1–0.3em`, uppercase.
- **Body** (rare in video): Inter 500, sentence case, max ~45 characters per line.
- Numbers use `fontVariantNumeric: "tabular-nums"` so counters do not jitter.

## Layout

- 72px safe margins at 1080p; HUD text sits in the corners, content never collides with it.
- Big imagery full-bleed; text blocks aligned left on a 12-column feel, not centered, except the final lockup.
- Corner brackets frame the subject instead of boxes or cards.
- Callouts: dot anchor (r=7) + ripple, 2px leader with an elbow, mono label above the horizontal segment.

## Imagery vocabulary

Sea from above, ships at sea in 3/4 view, bridges and ops rooms, radar PPI, sonar rings, circuit traces, neural networks, globe with graticule, coordinates, scale bars. Everything should look operational, not decorative.

## Copy

Short uppercase labels naming real things. Coordinates in `46°12′N · 006°04′W` form. Real scales (`12 742 km`, `90 m`, `60 cm`). No superlatives, no exclamation marks.
