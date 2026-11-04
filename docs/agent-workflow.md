# Agent Workflow

## Before editing

1. Identify the affected code and read only the matching guide; use the
   [documentation index](README.md) when the path is unknown.
2. Identify the route's HTML entrypoint and TypeScript module from [Architecture](architecture.md).
3. Check `git status --short` and preserve unrelated user changes.
4. Use the source-of-truth map below to focus searches; expand as needed.

## Source-of-truth map

| Concern | Authoritative location |
| --- | --- |
| Initial-page copy | `content/initial-page.json` |
| Initial-page markup | `src/render-initial-page.ts` |
| Other route markup and copy | Route `index.html` |
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

## Development modes

For substantial features, architecture changes, or multi-file implementations
without a specified mode, ask: “Would you like to build this in chunks
(structure → scaffolding → implementation) or one-shot?” Small fixes,
straightforward refactors, and minor edits proceed normally. A request to
complete the implementation selects one-shot; explicit chunks, scaffolding,
step-by-step work, or pair programming select chunked mode. Honor an existing
choice without asking again. The choice applies only to the current task.

In one-shot mode, finish the authorized scope, run relevant checks, and report
results without routine stage approvals. In chunked mode, agree a short sequence
of responsibilities first. Complete one small, reviewable responsibility through
the stages below before starting another; do not scaffold an entire feature
across database, API, and UI at once.

## Chunked stages

1. **Structure:** Inspect affected code and reusable modules. Propose the smallest
   file tree, marking new and modified files, and explain responsibilities,
   dependencies, and data-flow direction. Once agreed, create only the agreed
   empty files or responsibility comments. Keep existing behavior functional.
   Stop for structure approval and a request to make the scaffolding.
2. **Scaffolding:** Establish only the current unit's types, signatures,
   imports/exports, and minimal call flow. Prefer functions; justify classes by
   actual state or existing patterns. No business logic or fabricated success:
   unfinished leaf functions throw a clear `Not implemented` error. Keep stubs
   disconnected from working entrypoints where possible. Present contracts,
   inputs/outputs, side effects, error paths, and unfinished functions. Run
   practical structural checks and disclose temporary failures. Stop for approval
   before implementing behavior.
3. **Implementation:** Briefly explain the unit's role and callers, then implement
   one meaningful function or tightly coupled responsibility. Add focused checks
   for non-trivial behavior and run relevant verification. Explain the result,
   error handling, and remaining limits. Stop for review before the next unit;
   describe its scope without starting it.

Structure approval alone does not authorize scaffolding. Scaffolding approval
authorizes the first agreed implementation unit, not all remaining units.
“Next chunk” advances one checkpoint. Corrections steer the current work without
restarting the process; “finish the rest” switches remaining work to one-shot.
After the final unit, verify integrated behavior. Never mark user review complete
without user input.

## Persistent task state

Use `docs/plans/active/<task>.md` only when multi-step work needs persistent state.
Record decisions, completed/incomplete steps, blockers, and next actions. Read
only the current task's plan; do not use agent instructions or indexes as logs.
On completion, delete disposable plans or move useful history to
`docs/plans/archive/` with a status note, updating links. Create directories only
when needed. Promote enduring decisions to authoritative references instead of
copying them into plans. Historical plans do not override current guidance.
