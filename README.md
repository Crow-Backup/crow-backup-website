# Crow Backup website

A custom Hugo website for [crowbackup.ch](https://crowbackup.ch/), with German and English Markdown content. The existing 21 pages, 14 blog posts and 20 archive URLs are preserved.

## Preview

Install Hugo **0.167.0 or newer**. No npm installation is needed to build or serve the website.

```powershell
hugo server --port 1414 --disableFastRender
```

On this workspace, a downloaded Hugo executable is also available at `.tools/hugo.exe`:

```powershell
.\.tools\hugo.exe server --port 1414 --disableFastRender
```

Open `http://localhost:1414/`. Review the visual style guide at `/style-guide/` and the design notes in [docs/style-guide.md](docs/style-guide.md).

## Edit

- `content/de/` and `content/en/`: pages and articles. JSON front matter is followed by Markdown.
- `layouts/`: Hugo templates and shortcodes.
- `static/css/site.css`: design tokens, layout and responsive styles.
- `data/navigation.json`: language-specific navigation and existing URLs.
- `data/downloads.json`: working installer links; the browser refreshes them from the existing release service.
- `static/wp-content/uploads/`: migrated media at their original paths.
- Articles and blog/archive cards retain the original featured images. Featured images are imported from WordPress media records, separately from article body content.

Onboarding cards support `icon="computer"`, `icon="connect"` and `icon="folder"`. These use matching SVG line icons. Blog entries do not display the former “admin” author.

## Build and check

```powershell
npm ci
hugo --destination .tools/build --minify --printPathWarnings --printI18nWarnings
node scripts/llms.mjs .tools/build
npm run check
```

The check verifies every original sitemap URL, original prose paragraphs, internal links, anchors, media, downloads, FAQ controls and team profiles. Run the browser checks with the preview server running and Microsoft Edge installed:

```powershell
node scripts/visual-check.mjs
```

Screenshots are saved under `.tools/screenshots/`.

Run `node scripts/audit.mjs` for accessibility checks on every page at desktop/mobile widths and an SEO inventory. Run `node scripts/media-audit.mjs` to compare all live source-page images, including featured images, against the rendered migration. Reports are saved in `reports/`. Video captions have been generated and a text alternative added; the caption wording and timing still need human review.

`node scripts/keyboard-check.mjs` verifies all original routes at 320 px, keyboard navigation and reduced-motion behavior, plus the style guide and 404 pages. Future LLM runs should read [AGENTS.md](AGENTS.md) first.

## GitHub Pages

The workflow in [.github/workflows/github-pages.yml](.github/workflows/github-pages.yml) validates pull requests and deploys pushes to `master` or `main`. It uses Hugo 0.167.0 and official GitHub Pages actions, with deployment permissions limited to the deploy job. See [docs/github-pages.md](docs/github-pages.md) for the repository and domain setup.

## Contact form

The German and English contact forms submit directly to the configured Formspree endpoint, `https://formspree.io/f/maeqeovg`, using an HTML POST with the `name`, `email`, `subject` and `message` fields. Recipient settings and submission handling are managed in Formspree. The endpoint is set in `params.contactEndpoint` in `hugo.toml`; clearing it disables the submit button and displays a setup notice. End-to-end delivery must be verified with a real submission after deployment.

## Product structured data

The German and English homepages include JSON-LD `SoftwareApplication` data for Crow Backup, with the visible description, supported desktop operating systems, screenshots and a free offer linked to the corresponding download page. Both translations share one software identifier. Ratings and reviews are omitted because none have been verified; Google's software rich results require a rating or review, so this markup alone does not make the site eligible for that display.

## Markdown and contributions

`node scripts/llms.mjs [outputDirectory]` generates `llms.txt` and an `index.md` alongside every content-backed HTML page, including articles, archives and the style guide. It converts the rendered page to Markdown so FAQs, tables, shortcodes and article listings remain readable. Run it after Hugo and before the content checker; GitHub Actions does this automatically. Node is required for these exports, while Hugo alone still builds the HTML site.

Each page has matching understated text links to its Markdown version and to “Improve this page”, which opens its German or English source file in GitHub's editor on `master`. Contributors without write access can propose changes through GitHub's fork and pull-request flow.

## Migration

[migration/manifest.json](migration/manifest.json) records the complete source URL inventory. [migration/content-audit.json](migration/content-audit.json) contains the original plain-text paragraphs used for verification. Original text, technical commands, legal content, donation links, app-store links and release notes are retained. Known broken legacy links and obsolete portrait hostnames are repaired.

`npm run migrate` is a one-time import tool, **not a build step**. It downloads the live WordPress content and rewrites migrated Markdown. Do not rerun it after editorial changes unless you intend to replace that content. The ignored `.migration-source/` directory caches source responses; remove selected cache files if you deliberately want to fetch newer content. `node scripts/fonts.mjs` refreshes self-hosted font files and their licenses.
