# Agent Workflow

## Before editing

1. Read this documentation index and the guide matching the requested change.
2. Identify the route's HTML entrypoint and TypeScript module from [Architecture](architecture.md).
3. Check `git status --short` and preserve unrelated user changes.
4. Search only after checking the documented source-of-truth locations below.

## Source-of-truth map

| Concern | Authoritative location |
| --- | --- |
| Route markup and copy | Route `index.html` |
| Route behavior and API requests | Matching `src/*.ts` module |
| Shared browser state | `src/member.ts` |
| Shared layout and responsive styling | `src/style.css` |
| Static images and fonts | `public/` |
| Production entrypoints | `vite.config.ts` |
| API contract | `docs/allocation-backend.md` and the backend repository |
| Deployment | `.github/workflows/deploy-registration-site.yml` |

## Safe implementation rules

- Reuse the shared page structure and CSS classes before adding new ones.
- Keep route behavior in its dedicated TypeScript module.
- Keep local-storage schema changes in `src/member.ts`.
- Do not put secrets in frontend code or commit environment-specific credentials.
- Do not change API field names, allocation keys, plan names, or budgets casually; these are integration and product contracts.
- Treat backend payment authorization as authoritative. Local storage only improves the browser experience and must not be treated as proof of payment.
- Preserve accessible labels, keyboard controls, button disabled states, and live status messages when changing forms or allocation controls.

## Validation workflow

After implementation:

```sh
bun run format
bun run lint
bun run build
```

Then manually inspect the affected route and at least one unaffected route. For UI changes, check desktop and mobile widths. For API-flow changes, test success, missing identifiers, unavailable API, backend errors, and retry behavior where applicable.

## Common pitfalls

- Forgetting to register a new HTML entrypoint in `vite.config.ts`.
- Using `/src/...` or relative asset paths instead of root-relative `/...` paths for files in `public/`.
- Duplicating `.card-block`, typography, or responsive rules instead of reusing the shared system.
- Assuming `/success/` is the only Stripe return path; the allocation flow expects `/allocate-payment/`.
- Allowing allocation submission before the full plan budget is assigned.
- Changing an allocation after submission and assuming it edits the prior historical record.
