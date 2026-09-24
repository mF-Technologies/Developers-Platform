# mF Technologies Developer Platform

Developer onboarding and interactive OpenAPI reference for the Trader platform. The site is built with Docusaurus 3.10, TypeScript, Bun, and Redocusaurus.

## Requirements

- Bun 1.3 or newer
- Node.js 20 or newer for Docusaurus
- Sibling `../platform-next/document` and `../realtimechartserver/document` checkouts when refreshing source content

## Local development

```bash
bun install
bun run sync:content
bun start
```

The development server is available at `http://localhost:3000` by default.

## Content sources

`bun run sync:content` refreshes OpenAPI specifications from the sibling service repositories:

- `openapi/fxserver-trader.yaml`
- `openapi/webproxy.yml`
- `openapi/realtime-chart-server.yml`

The guides in `docs/` are curated for this developer platform and are not overwritten by content sync. Set `PLATFORM_NEXT_DOCUMENT_DIR` or `REALTIME_CHART_SERVER_DOCUMENT_DIR` to use different source checkouts. The synced files are committed so GitLab CI does not need access to the sibling repositories.

## Validation

```bash
bun run typecheck
bun run test:i18n
bun run build
```

## GitLab Pages

The pipeline in `.gitlab-ci.yml` publishes `build/` when a commit reaches the default branch. Docusaurus receives `CI_PAGES_URL`, so both custom-domain and project-path Pages deployments use the correct base URL.

## GitHub Pages

The workflow in `.github/workflows/github-pages.yml` validates pull requests and publishes `build/` after changes reach `main`. It uses the URL reported by GitHub Pages so Docusaurus generates correct links for both custom-domain and project-path deployments.

Before the first deployment, set **Settings > Pages > Build and deployment > Source** to **GitHub Actions** in the GitHub repository.

## Update `redocly.yaml` to control open api tags visibility

```yaml
plugins:
  - ./redocly-plugins/tag-whitelist.cjs

decorators:
  tag-whitelist/only:
    tags: # All tags are hidden by default. You need to add tags to make them visible.
      - Authentication
      - Configuration
      - Account
      - Trading
      - Orders
      - Positions
      - Trade History
      - Account Updates
      - Chart Data
  remove-unused-components: on
```
