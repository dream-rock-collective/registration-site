# Development and Deployment

## Local development

Install dependencies with the repository's lockfile and start Vite:

```sh
bun install --frozen-lockfile
bun run dev
```

The frontend defaults to `http://localhost:6942` for API calls when served on localhost. Override it with:

```sh
VITE_API_BASE_URL=https://your-api.example bun run dev
```

The backend must be running separately if you want to submit registration, create checkout sessions, or submit allocations.

## Validation and production build

Run the normal checks before handing off a change:

```sh
bun run format
bun run lint
bun run build
```

`bun run build` runs TypeScript checking and creates the production site in `dist/`. Use `bun run preview` to inspect the built output locally.

Formatting rewrites HTML, CSS, and TypeScript files, so inspect the resulting diff afterward.

## GitHub Pages deployment

`.github/workflows/deploy-registration-site.yml` runs on pushes to `main` and manual workflow dispatches. The workflow:

1. Installs Bun dependencies with the frozen lockfile.
2. Runs `bun run build`.
3. Uploads `dist/` as the Pages artifact.
4. Deploys the artifact to the `github-pages` environment.

The workflow currently uses the production API default because production builds do not set `VITE_API_BASE_URL`.

## Release checklist

- Confirm all intended HTML entrypoints are present in `vite.config.ts`.
- Confirm API paths and payloads still match the backend contract.
- Run formatting, linting, and the production build.
- Test the changed route at desktop and narrow mobile widths.
- For registration/payment changes, verify query-string and local-storage transitions.
- For allocation changes, verify the total budget, organization keys, disabled states, and submission payload.
