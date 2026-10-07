# Accessibility review

Reviewed on 7 October 2026 against WCAG 2.2 A/AA automated checks and axe best practices.

## Scope and evidence

- All **55 migrated URLs**, at **1440 px** and **390 px** viewport widths: **110 axe page audits, zero automated violations** after corrections.
- Native FAQ answers were expanded during the audit, so their text, headings, links and tables were included.
- Source-route/content checks verify **510 original prose paragraphs**, internal links/anchors, media files, all download options, four team members in each language and seven featured images per blog.
- Representative desktop/mobile visual tests verify loaded images, no horizontal page overflow, functioning FAQ controls and mobile navigation, and no JavaScript page errors.
- The source-image comparison covers all 55 live pages and their migrated counterparts, including featured images and equivalent responsive thumbnail sizes.
- All 55 original routes also pass 320 px reflow checks. Keyboard tests pass for the skip link, mobile-menu operation, Escape focus restoration and native FAQ toggling. The added style guide and both 404 pages pass their automated accessibility checks.

Machine-readable results: [accessibility.json](accessibility.json). Media comparison: [media.json](media.json). Run `node scripts/audit.mjs` to reproduce the automated review with the local preview running.

## Improvements made

- Increased language-switch hit targets and gave language links descriptive accessible names.
- Strengthened contrast for blog artwork labels.
- Corrected skipped heading levels while preserving heading text and anchors.
- Repaired the X/Twitter link that Markdown had incorrectly interpreted as an unlabelled task-list checkbox.
- Added clear operating-system names to download-link labels.
- Made horizontally overflowing tables keyboard-scrollable, with named regions and column-header scopes.
- Added a keyboard focus target for the skip link and restored menu-button focus when Escape closes the mobile menu.
- Allowed long headings to wrap/hyphenate, fixing narrow-screen overflow on the German privacy page and a tag archive.
- Retained visible focus indicators, native keyboard-operable FAQ accordions and reduced-motion scrolling behavior.
- Restored article featured images and their source text alternatives; decorative listing thumbnails avoid duplicate announcements.
- Added German draft captions, an English translation and a text alternative describing the explainer video's content and key visuals. Confirmed the three GIF “snapshot” illustrations are single-frame images, rather than autoplaying animations.

## Review still needed

The caption tracks are machine-generated drafts, with obvious recognition errors corrected. **Wording, speech timing and any necessary sound cues require a human review against the audio before launch.** The text alternative covers the main explanation and the cat/accident illustration; complete audio-description coverage still needs review.

An axe pass does **not** establish full WCAG conformance. Assistive-technology checks with a screen reader, detailed caption/audio-description review, and production contact-form validation/error handling after a real delivery service is connected remain necessary. The currently unconfigured form is disabled and explains that delivery is pending.

Reference: [W3C WCAG 2.2 quick reference](https://www.w3.org/WAI/WCAG22/quickref/).
