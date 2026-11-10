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

Primary action: green button with dark text and a Forest border to clarify its boundary on light backgrounds. Text contrast is 6.87:1 normally and 8.35:1 on hover; the Forest border contrasts 6.82:1 against Paper. Secondary action: underlined text link. Provide visible keyboard focus, a skip link and touch-friendly targets. Native details/summary controls work without JavaScript. Respect reduced-motion preferences. Download links have build-time fallbacks; JavaScript refreshes the latest release when available. Self-host fonts and migrated media.

## Crow illustration study

The style guide previews six full-body crow illustrations and 10 compact action icons from `static/images/crow-art/`. The original logo is displayed beside the study. The birds reuse the original logo SVG paths for the head, beak and eye. The head mask restores the original feather cutouts together with the original 16-unit boundary stroke as a transparent trim. The earlier adaptation omitted that outer trim and left a black rim/triangle around the cutouts; removing the cutouts entirely was too broad a correction. Both negative shapes now come directly from the original logo, preserving its feather detail. The circle illustrations now reuse the icon crow’s exact body, tail, wing and feet, replacing the separate body drawing. The compact icons reuse the same original head paths; per-asset mask IDs remain unique across the inline gallery. Proposed accent surfaces remain Clay `#F6DDD0`, Sky `#DDECF2` and Lilac `#EAE3F4`, with Ink for text.

Full-body illustrations have 200 × 200 viewBoxes. The action icons are character illustrations on transparent 64 × 64 viewBoxes, previewed at 32, 48 and 64 px. They communicate through the crow's action rather than an adjacent symbol: reading bends its head toward pages held by a wing. Other retained poses include writing, landing with a parcel in its claws, offering a gift, resting and spreading wings. Help shows a crow assisting another; team has three birds. The gallery gives reading a larger preview. These detailed character icons need visible text labels, especially at 32 px.

Support / “Headset tragen”, exchanging, invite, language, question, security and share were withdrawn after user review. Their SVGs are archived in `docs/design-drafts/crow-icons/`, outside the published static assets, pending redesign. “Headset tragen” and Support were two previews of the same file. Do not restore these drafts without another design review.

Hover and keyboard focus gently move the head or gesture; reduced-motion preferences disable animation.

`layouts/_shortcodes/crow-art.html` presents the study; `static/css/crow-art.css` isolates its layout styles. Inline SVGs receive unique title/description IDs. When integrating an icon into an already labeled control, hide the decorative SVG from assistive technology and label the control itself. SVGs opened directly retain their internal hover styles; `<img>` embedding does not expose internal elements to page hover/focus selectors.

The backup explainer is postponed and is not included in the published assets. Its flow, animation and technical details need separate review before implementation.

Contact letters and courier parcels follow the head that carries them; the landing parcel stays anchored to the claws.

`crow-walking.svg` is a transparent 320 × 220 SVG using the agreed icon anatomy. Its 1.2-second in-place walk alternates the legs by half a cycle; foot placement, lift and a subtle body bob animate with CSS. The gallery provides a play/pause checkbox; the standalone asset loops automatically. Reduced-motion preferences show a still pose. CSS path interpolation requires a modern browser; the underlying paths provide a static fallback. `crow-footprint.svg` is a transparent 128 × 160 stylized print with three forward toes and one rear toe, intended as decorative artwork rather than a field-identification reference. Both downloads are previewed in the style guide.

## Decorative crow flock

`crow-flock.html` and `crow-flock-bird.html` add three decorative, assistive-technology-hidden birds immediately above the footer. There are no side flocks. `static/css/crow-flock.css` is included in the fingerprinted style bundle; `static/js/crow-flock.js` manages two-dimensional wandering, separation, action pauses and footprint lifetimes. The habitat overlaps the preceding content by up to 60 px, with no opaque background. Birds scroll naturally with the page. Bird widths are 67.2 px on desktop and 53.76 px on narrow screens: 12% larger than the earlier 60/48 px birds. Masks receive unique IDs per instance.

Birds maintain up to 150 px separation, adjusted for narrow screens. Footprints start at 48% opacity, follow the direction of travel, fade in eight seconds and are removed; live tracks are capped at 240. A pause is either a 1.6-second double peck or a 2.2-second double call, then walking resumes. Calling lifts the head and opens a lower-beak shape twice, with a single decorative “kraa” shown on each beat. It does not play sound.

Cursor proximity or a pointer press sends a crow away at 4.2 times its walking speed with a faster gait, interrupting pecking or calling. Escape destinations stay inside the habitat and preserve spacing. The entire crow layer has `pointer-events: none`; passive document listeners observe pointer coordinates without intercepting clicks on underlying content.

Reduced-motion users see three static birds; background tabs stop both JavaScript movement and CSS animation. There is no pause button or saved pause preference. Without JavaScript, the habitat remains hidden.

The German team page uses the Team SVG beside its heading. The German development-support page uses `layouts/donate.html`: copy and donation buttons form the left column, with a large Donate crow (up to 400 px) on the right. Below 820 px these stack, with the crow below the copy (up to 280 px). Both reuse `headingIcon` front matter and `crow-page-icon.html`. The icons are decorative beside the visible page title, keep their hover/reduced-motion behavior, and receive page-specific mask IDs.
