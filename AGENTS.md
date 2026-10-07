# Working on the Crow Backup website

Read this file and `README.md` before changing the project. This is a **custom Hugo website**, not WordPress, an npm web application or a Sites project.

## Purpose and user preferences

- Replace crowbackup.ch's design while preserving its existing page structure and complete German/English content.
- All 55 original sitemap URLs are migrated: 21 pages, 14 posts, 20 category/tag/author archives. Preserve existing URLs unless explicitly asked to change them.
- Accessibility improvements are authorized. Audit every page after shared-template changes. Do not claim complete WCAG conformance from automated checks alone.
- **Ask before applying SEO changes**, including search titles, descriptions, robots/noindex policies, canonical/hreflang changes, structured data or search-facing URL changes. Prepare specific, reviewable proposals first. See `reports/seo-proposals.md` for recommendations awaiting approval.
- Hide the blog author `admin`; keep named contributors. The importer omits admin author fields and renames the legacy admin archive heading to Crow Backup while preserving its URL.
- Homepage onboarding steps use **large SVG line icons**, not emoji: computer, connection and folder. Use the established dark-green strokes, pale-green tiles and consistent sizes.
- The homepage app preview is a **monitor**, with a bezel, chin and stand. Do not add a browser/title-bar frame around the app screenshot.
- Hide breadcrumbs that contain only “Crow Backup /”. Do not reintroduce the generic root-only breadcrumb.
- GitHub Pages is the requested deployment platform. Do not replace it with another hosting service.

## Style guide

- Visual guide: `/style-guide/` (local preview: `http://localhost:1414/style-guide/`).
- Editable visual-guide copy: `content/de/style-guide.md`.
- Technical design reference: `docs/style-guide.md`.
- CSS tokens and responsive styles: `static/css/site.css`.

Concept: **Safely held, together.** Calm Swiss clarity and shared storage between people who trust one another. Existing Crow logo and green `#92BD11` are retained. Ink `#20281F`, Forest `#42600C`, Paper `#F8F9F3`, Sage `#EDF2DF`. Manrope for headings/UI; IBM Plex Sans for body text. Fonts are self-hosted and licensed. Use dark text on bright green; bright green is not a small-text color on white.

Spacing follows 8 px increments. Container maximum: 1280 px. Desktop gutters: 48 px; mobile: 20 px. Cards: 16 px radius, 24 px gaps, about 30 px padding. Maintain responsive layouts and meaningful keyboard focus. Current step tiles: 72 px desktop / 64 px mobile, icons 38 px / 34 px.

## Architecture and editing

- `hugo.toml`: base URL, locales, content directories, Markdown settings and optional contact endpoint.
- `content/de/`, `content/en/`: JSON front matter followed by Markdown. Page URLs are explicit; language directory names do not necessarily equal original slugs.
- `content/*/_index.md`: homepage copy and hero parameters.
- `content/*/posts/`: articles. `type: posts` drives blog listings. `translationKey` pairs translations.
- `content/*/archives/`: source taxonomy and author URLs with explicit article references.
- `data/navigation.json`: translated navigation routes. `data/downloads.json`: build-time installer links.
- `layouts/baseof.html`: HTML head, global landmarks. `layouts/home.html`, `page.html`, `blog.html`, `archive.html`: page layouts.
- `layouts/_partials/`: header, footer, post cards and step icons.
- `layouts/_shortcodes/`: cards, grids, FAQs, profiles, buttons, downloads, contact form, media and guide specimens.
- `layouts/_markup/`: accessible Markdown render hooks, including keyboard-scrollable tables.
- `static/css/`, `static/js/`, `static/fonts/`: self-contained assets. Keep fonts local.
- `static/wp-content/uploads/`: migrated original images/video at preserved paths. WordPress featured images are separate from body content: all 14 posts have covers, and blog/archive cards use those original images. Keep the importer and checker aware of featured media.
- `static/captions/`: German machine-generated video captions and English translations. These are drafts; review wording and timing against the source video before claiming media conformance.

Use `relURL` for root-relative links/assets in templates and render hooks. Preserve fragment-only URLs as fragments. Test both the root domain and the GitHub project subpath. Do not prepend the base path twice to `.RelPermalink`.

Hugo 0.167 uses `locale`, `label`, `build`, `hugo.Data` and `hugo.Sites`. Do not reintroduce the obsolete `languageCode`, `languageName`, `_build`, `site.Data` or `site.Sites` forms. Markdown renderer `unsafe` is enabled to render trusted nested shortcode HTML; do not copy executable WordPress scripts into content.

## Build and verification

Hugo **0.167.0** is pinned in `.github/workflows/github-pages.yml`. The site itself builds without Node. Node is used for migration and validation tools.

```powershell
npm ci
hugo server --port 1414 --disableFastRender
hugo --destination .tools/build --minify --printPathWarnings --printI18nWarnings
node scripts/llms.mjs .tools/build
node scripts/check.mjs
node scripts/visual-check.mjs
node scripts/audit.mjs
node scripts/keyboard-check.mjs
```

In this Windows workspace, `.tools/hugo.exe` is available as an ignored local helper. The browser checks use installed Microsoft Edge in headless mode. A preview server on port 1414 must be running. Use a separate production output directory for checks; live servers can rewrite `public/` with development canonical URLs or livereload scripts.

- `scripts/check.mjs [outputDirectory]`: all 55 source routes, original paragraphs, internal references, anchors, assets, installer links, FAQs and team profiles. Default directory is `.tools/build`.
- `scripts/visual-check.mjs`: representative desktop/mobile screens, image loads, overflow, FAQ buttons and mobile menu. Screenshots: `.tools/screenshots/`.
- `scripts/audit.mjs`: all 55 URLs at 1440 px and 390 px using axe, plus per-page production SEO inventory. Opens collapsed FAQs during the audit. Blocks livereload scripts to avoid navigation races. Results: `reports/accessibility.json` and `reports/seo.json`.
- `scripts/media-audit.mjs`: compares upload images used on every live source page with images rendered on its migrated page. Includes featured images; normalizes WordPress thumbnail suffixes. Report: `reports/media.json`.
- Also check keyboard navigation, focus/skip link, enlarged text, responsive tables and media manually. Captions require human checks for wording/timing; animation controls must respect reduced motion.
- `scripts/keyboard-check.mjs`: 320 px reflow on every original route, keyboard skip link/menu/FAQ, Escape focus restoration, reduced motion, plus axe checks on the added style guide and both 404 pages.

For GitHub project-path verification:

```powershell
hugo --baseURL https://crow-backup.github.io/crow-backup-website/ --destination .tools/subpath-build
node scripts/llms.mjs .tools/subpath-build
node scripts/check.mjs .tools/subpath-build
```

## Migration safeguards

`scripts/migrate.mjs` is a one-time importer. **Do not rerun it during ordinary edits**: it overwrites all migrated Markdown and may undo editorial changes. Only run it intentionally, after checking what will be replaced. It preserves the user-requested icon/admin rules, repairs obsolete asset hosts and legacy links, converts WordPress content to Markdown and shortcodes, and preserves heading IDs.

`.migration-source/` caches original API and sitemap responses and is ignored. `migration/manifest.json` is the committed source-route/media inventory. `migration/content-audit.json` stores source paragraphs so CI can verify content without access to WordPress. Do not modify audit snapshots just to make a content-loss check pass. Explain intended editorial changes and update checks narrowly when authorized.

The root `current-home.html`, API dump JSON and downloaded tool files are ignored inspection artifacts. Do not commit them, `.idea/`, `node_modules/`, `public/`, `.tools/`, secrets or model caches.

## Deployment and outstanding configuration

Repository remote: `git@github.com:Crow-Backup/crow-backup-website.git`. Local branch: `master`. Workflow validates PRs and deploys pushes to `master` or `main` using official GitHub Pages actions. `docs/github-pages.md` explains enabling the repository's Pages source and setting the custom domain/DNS.

The workflow file alone does not enable repository Pages settings or change DNS. Report actual deployed status accurately. Do not claim a live deployment without a successful workflow/deployment check.

Contact forms are configured to POST to the user-supplied Formspree endpoint `https://formspree.io/f/maeqeovg` through `params.contactEndpoint`. Recipient settings are managed in Formspree. Clearing the endpoint disables the form. Do not claim end-to-end delivery without a successful submission check or silently transmit messages to the old WordPress backend.

SEO recommendations in `reports/seo-proposals.md` are pending approval. They include shorter titles/descriptions and an archive indexing decision. Retain current indexing/metadata until the user approves specific changes.
