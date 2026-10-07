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

The migrated contact pages have a new form. Set `params.contactEndpoint` in `hugo.toml` to your form service's HTTPS POST endpoint to enable delivery. Until configured, the submit button is disabled and the page explains that delivery is pending. No messages are sent to an unconfigured destination. [Formspree's HTML forms](https://formspree.io/html/) are one compatible option; a custom service accepting the `name`, `email`, `subject` and `message` fields also works.

## Migration

[migration/manifest.json](migration/manifest.json) records the complete source URL inventory. [migration/content-audit.json](migration/content-audit.json) contains the original plain-text paragraphs used for verification. Original text, technical commands, legal content, donation links, app-store links and release notes are retained. Known broken legacy links and obsolete portrait hostnames are repaired.

`npm run migrate` is a one-time import tool, **not a build step**. It downloads the live WordPress content and rewrites migrated Markdown. Do not rerun it after editorial changes unless you intend to replace that content. The ignored `.migration-source/` directory caches source responses; remove selected cache files if you deliberately want to fetch newer content. `node scripts/fonts.mjs` refreshes self-hosted font files and their licenses.
