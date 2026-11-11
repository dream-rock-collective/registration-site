# Dream-Rock Collective Site Documentation

Use this index when you need to find a reference. Identify affected code first,
read only matching sections, and follow known links directly. Links are navigation,
not automatic imports; reuse unchanged guidance already read during the task.
Source and configuration own implementation details.

## What this repository contains

This repository is the public frontend for Dream-Rock Collective. It is a Vite multi-page site that lets visitors:

1. Register with their name, email, optional mailing address, and optional birthday.
2. Choose a one-time, monthly, or yearly subscription.
3. Complete payment through Stripe Checkout.
4. Allocate the community-reinvestment portion of their payment among three organizations.

The API and Docker deployment live in the separate `drc-backend` repository. This repository calls the API but does not contain its implementation.

## Documentation map

- [TypeScript](typescript.md) — contracts, validation, functions, imports, and absence semantics.

- [Site overview](site-overview.md) — routes, user journey, browser state, plans, and allocation behavior.
- [Architecture](architecture.md) — source layout, page entrypoints, modules, styling, assets, and environment configuration.
- [Adding pages](adding-pages.md) — how to create a page and integrate it with the shared visual system.
- [Backend integration](allocation-backend.md) — API endpoints, request/response contracts, and frontend/backend responsibilities.
- [Deployment](deployment.md) — local builds, production output, GitHub Pages deployment, and release checks.
- [Agent workflow](agent-workflow.md) — how to find the right source of truth, make changes safely, choose chunked or one-shot work, maintain task state, and validate changes.

- [Feature plans](plans/active/README.md) — proposed feature branches, linked PR boundaries, dependencies, and acceptance checks.

## Quick commands

```sh
bun install
bun run dev       # local development server
bun run format    # format HTML, CSS, and TypeScript
bun run lint      # lint CSS
bun run build     # type-check and create dist/
bun run preview   # preview the production build
```

The local API defaults to `http://localhost:6942`. Set `VITE_API_BASE_URL` when using another backend. Production defaults to `https://api.dreamrock.co`.

## Where to look first

| Task | Start here |
| --- | --- |
| Change editable copy | `content/initial-page.json` |
| Change page structure | Main renderer or additional-page templates in `src/` |
| Change route behavior or API calls | The matching `src/*.ts` module |
| Change shared visual behavior | `src/style.css` |
| Add a new route | `docs/adding-pages.md` and `vite.config.ts` |
| Change registration or payment integration | `src/main.ts`, `src/registered.ts`, and [Backend integration](allocation-backend.md) |
| Change allocation behavior | `src/allocate-payment.ts` and [Site overview](site-overview.md) |
| Change static images or fonts | `public/` and [Architecture](architecture.md) |
| Change deployment behavior | `.github/workflows/deploy-registration-site.yml` and [Deployment](deployment.md) |

## Important boundaries

- Do not invent backend behavior from the frontend. Treat [Backend integration](allocation-backend.md) as the contract and coordinate backend changes in `drc-backend`.
- Plan budgets and organization keys are frontend-owned today. Changing them changes the product behavior and the payload sent to the backend.
- The site is intentionally built from static HTML entrypoints with shared CSS. Reuse the existing structure before introducing a new component or styling system.
