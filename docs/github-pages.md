# Publishing to GitHub Pages

Repository: `Crow-Backup/crow-backup-website`. Default local branch: `master`.

The workflow follows the [official Hugo GitHub Pages guide](https://gohugo.io/host-and-deploy/deploy-to-github-pages/). It runs content and link checks before uploading a deployment artifact, and deploys using the repository's `GITHUB_TOKEN`. No personal access token or external hosting service is required.

## Enable publishing

1. Commit and push the website and `.github/workflows/github-pages.yml` to `master` (or `main`).
2. In [repository Settings → Pages](https://github.com/Crow-Backup/crow-backup-website/settings/pages), set **Source → GitHub Actions**.
3. Run **Build and publish Hugo to GitHub Pages** from the Actions tab, or push another commit. Pull requests build and validate without deploying.
4. Check the deployment job and `github-pages` environment for the published URL.

The publishing build uses `actions/configure-pages`'s base URL, so the initial project URL and the custom domain both work. Generated `public/` output is not committed.

HTTPS is the approved production scheme. The workflow upgrades the Pages base URL to HTTPS even when GitHub reports an HTTP URL, so canonical links, language alternates, social metadata and sitemap URLs use HTTPS. Enable **Enforce HTTPS** in Pages settings to redirect visitors arriving over HTTP as well.

Source links and assets use the `site-url.html` partial to remove the leading slash before Hugo's `relURL` adds the deployment base path. Do not pass `.RelPermalink` through this helper: it already includes that path. Keep `HUGO_RELATIVEURLS` disabled: Hugo's relative-URL rewrite duplicates the base path in project builds. The publishing build normalizes the Pages base URL to one trailing slash. CI checks both root-domain and project-path builds and validates the final publishing artifact.

After Hugo builds, `scripts/portable-urls.mjs` converts local HTML links and assets to paths relative to each output page. This lets the same artifact work at the GitHub project URL and the configured custom domain without changing canonical metadata. Markdown exports are generated after that conversion.

## Connect crowbackup.ch

Configure the domain in GitHub Pages settings before changing the website's DNS. See [GitHub's official custom-domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

1. Set **Custom domain** to `crowbackup.ch` in repository Settings → Pages.
2. At your DNS provider, point the apex (`@`) to GitHub Pages with these A records:

   ```text
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```

3. For `www`, use a CNAME to `crow-backup.github.io`.
4. Once GitHub has issued the certificate, enable **Enforce HTTPS**.
5. Rerun the workflow after the domain is configured so canonical URLs use `https://crowbackup.ch/`.

With an Actions deployment, the domain is configured in GitHub settings; a repository `CNAME` file is ignored and is not required. DNS changes affect the live website, so make the cutover when the migrated site and contact-message delivery are ready. The `downloads.crowbackup.ch` subdomain continues using the existing download service.
