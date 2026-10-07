# SEO changes for review

No recommendations in this document have been applied. This review covers all 55 migrated source URLs. The per-page inventory is in [seo.json](seo.json).

Canonical URLs, a single H1 per page, existing routes, language declarations and paired translations are present. All 55 source sitemap routes and internal links have been verified. Length checks below are editorial prompts, not hard Google limits. Google can rewrite titles and snippets.

## Proposed page titles

Use a separate SEO title field so the visible article titles remain unchanged.

| Page | Current title | Proposed title |
| --- | --- | --- |
| `/` | Crow Backup — Sichere deine Dateien bei Freund*innen. Kostenlos und verschlüsselt. | Crow Backup – kostenlose, verschlüsselte Backups mit Freunden |
| `/wie-ich-als-entwickler-meine-daten-mit-crow-backup-sichere/` | Wie ich als Entwickler meine Daten mit Crow Backup sichere \| Crow Backup | So sichert ein Entwickler seine Daten \| Crow Backup |
| `/en/crow-backup-your-secure-and-freely-accessible-solution-for-data-backup/` | Crow Backup – Your secure and freely accessible solution for data backup \| Crow Backup | Secure, freely accessible data backups \| Crow Backup |
| `/crow-backup-deine-sichere-und-frei-zugaengliche-loesung-fuer-datensicherung/` | Crow Backup – Deine sichere und frei zugängliche Lösung für Datensicherung \| Crow Backup | Sichere, frei zugängliche Datensicherung \| Crow Backup |
| `/en/crow-backup-the-ultimate-backup-solution-for-home-computers/` | Crow Backup: The ultimate backup solution for home computers \| Crow Backup | Backups for home computers \| Crow Backup |
| `/crow-backup-die-ultimative-backup-loesung-fuer-heimcomputer/` | Crow Backup: Die ultimative Backup-Lösung für Heimcomputer \| Crow Backup | Backups für Heimcomputer \| Crow Backup |

The English home title is already reasonably concise and can remain unchanged.

## Proposed homepage descriptions

The current descriptions reuse the full introductory paragraphs (263 characters in German, 201 in English). Replace only the search description; keep the visible copy.

- German: **Sichere Fotos und Dokumente verschlüsselt auf dem Computer von Freund*innen. Crow Backup ist kostenlos für Windows, macOS und Linux.**
- English: **Back up photos and documents on a friend's computer. Crow Backup encrypts your files before transfer. Free for Windows, macOS and Linux.**

## Archive indexing decision

There are 20 category, tag and author archive pages. Several repeat the same articles, some have no articles in one language, and all share a generic description. Recommend **noindex, follow** on these archive pages and exclude them from the sitemap, while retaining their URLs and access to articles. Main blog pages and every individual article remain indexable. This is an indexing change and needs your approval.

Alternatively, keep them indexable and write distinct introductions, metadata and meaningful translated groupings. That would require more editorial content.

## Other findings to retain for later review

- Several imported descriptions end mid-sentence because they were generated from excerpts. A later editorial pass could write complete descriptions for all content pages.
- Structured data could describe the software and articles, but should only include verified facts. No ratings or review claims should be invented.
- At cutover, verify the actual public canonical domain, HTTPS, sitemap availability and indexing in Search Console. The current audit examines the local production build, not search rankings or the future deployed server.

References: [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide), [localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions).
