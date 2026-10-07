# Crow Backup design guide

Concept: **Safely held, together.** Make backup feel personal, understandable and dependable. Pair Swiss clarity with a sense of shared responsibility. Keep the existing logo and brand green; use real product screenshots and portraits.

The visual guide is available at `/style-guide/`. Its editable source is `content/de/style-guide.md`.

## Palette

| Token | Hex | Use |
| --- | --- | --- |
| Crow Green | `#92BD11` | Existing brand green; primary buttons, accents, underlines |
| Forest | `#42600C` | Accessible links, focus indicators, small labels |
| Ink | `#20281F` | Headings, body text, footer, code blocks |
| Paper | `#F8F9F3` | Main background |
| Sage | `#EDF2DF` | Secondary panels, open FAQs, quotations |
| Muted | `#65705F` | Supporting copy |
| Line | `#DCE2D3` | Dividers and borders |
| White | `#FFFFFF` | Cards and forms |

Use Ink text on Crow Green buttons. Use Forest for links on light backgrounds. Do not use the bright brand green for small text on white. All tokens are defined at the top of `static/css/site.css`.

## Fonts

- **Manrope**, 500–800: headings, navigation, buttons. Geometric but friendly, with distinctive open shapes.
- **IBM Plex Sans**, 400–600: paragraphs, instructions, FAQs. Clear at small sizes and comfortable for technical content.
- **Consolas / system monospace**: commands and code.

Both families are self-hosted in `static/fonts/`, including Latin Extended for German characters. SIL Open Font License files are included. Font references: [Manrope](https://fonts.google.com/specimen/Manrope), [IBM Plex Sans](https://fonts.google.com/specimen/IBM+Plex+Sans).

| Role | Desktop | Mobile | Leading |
| --- | --- | --- | --- |
| H1 | 64 px | 38–53 px | 1.12 |
| H2 | 40–42 px | 28–32 px | 1.2 |
| H3 | 24 px | 20–24 px | 1.4 |
| Body | 18 px | 16 px | 1.65 |
| Card copy | 16 px | 14–16 px | 1.7 |
| UI | 12–14 px | 12–14 px | 1.4 |

## Space and shape

Use an 8 px spacing rhythm: 8, 16, 24, 32, 48, 64, 96. Container maximum: 1280 px. Desktop gutters: 48 px; tablet: 32 px; mobile: 20 px. Section spacing: 72–100 px desktop, 50–64 px mobile. Card gap: 24 px; padding: 30 px. Corners: 16 px cards, 8 px buttons. Borders: 1 px. Reserve soft shadows for the product preview.

## Layout and imagery

Homepage: clear proposition, prominent download action, real app preview inside a monitor bezel with a stand, shared-storage cues, onboarding steps, invitation, FAQs, advantages, app gallery, video, comparison, vision and final action. Preserve the current section order. Onboarding steps use large, consistent dark-green SVG line icons in pale-green tiles. Long documents have a sticky table of contents. Blog cards and articles use their original featured images; typographic artwork is a fallback for articles without covers. Team pages use original portraits and biographies.

Keep graphics quiet: circular paths represent exchange; the logo is the primary brand mark. Avoid stock server imagery and exaggerated security claims. Copy is direct and personal. Preserve original technical and legal content during migration.

## Interaction

Primary action: green button with dark text. Secondary action: underlined text link. Provide visible keyboard focus, a skip link and touch-friendly targets. Native details/summary controls work without JavaScript. Respect reduced-motion preferences. Download links have build-time fallbacks; JavaScript refreshes the latest release when available. Self-host fonts and migrated media.
