# Content editor implementation

## Shared sequence and ownership

1. Backend Git publisher and initial-page JSON conversion run in parallel subagents.
2. Integrate and verify both before the backend admin editor.
3. Implement the live preview after the editor.

The backend plan tracks Git/authenticated APIs/editor/preview hosting. This plan tracks the site content contract, renderer, preview integration, and verification. Work is on `editor`; no production pushes are authorized for verification.

## Contract and decisions

- Source: `content/initial-page.json`.
- Shared validation/types: `src/content.ts`, exporting `validateInitialPageContent(unknown)` and `InitialPageContent`.
- Shared rendering: `src/render-initial-page.ts`, exporting `renderInitialPage(content)` (main element).
- Content groups: join (including fixed-name field labels/placeholders), member, messages, sections, footer. Metadata, branding/logo alt text, and membership labels stay fixed in code.
- Sections are ordered `{ title, body, image?: { src, alt } }` records, without content IDs or types. FAQs use bold questions in the shared body format.
- Restricted rich text: p, ul, ol, li, strong, em, a with href only, br. Links allow HTTP(S), mailto, root-relative paths, and fragments. No arbitrary attributes or embedded images.
- Member templates accept `{firstName}` in overlayHeading and `{plan}` in overlayPlan; variable names are code-owned. The former dead banner heading is omitted.
- Registration field names/limits, DOM hooks, API payloads and validation stay fixed in code. Other pages remain unchanged.
- Optional images select existing assets; uploads deferred to v2.

## Progress

- [x] Chunk 2: initial copy extracted, generic sections rendered, runtime messages read from JSON.
- [x] Chunk 2: focused validation/rendering regression tests, production build and CSS lint.
- [x] Chunk 2: desktop/mobile agent-browser visual and registration-flow checks (primary agent ran with working escalation).
- [x] Chunk 1 integration gate: backend publisher 13 tests, build and typecheck pass (backend owner).
- [x] Chunk 3 editor integration (backend owner); real authenticated draft/edit/local publish checked by root.
- [x] Chunk 4 preview entry, shared renderer/CSS, isolated messaging, and focused tests.
- [x] Chunk 4 integrated browser verification (primary agent).

Chunk 4 preview uses separate `preview.html`/`vite.preview.config.ts`, with
parent-source/origin/token checks and disabled form/navigation actions. It has no
registration, payment, or member-storage imports. Site normal and preview builds
pass; three focused preview-message/dependency tests pass. Backend preview tests
build the actual site, verify generated asset CORS/CSP and cache refresh, and
reject traversal, missing dependencies, and source symlinks.

## Verification

- `bun test`: 13 tests / 60 assertions pass, including content/rendering, dollar replacement sequences in Vite, unsafe HTML/links/images, and preview message boundaries.
- `bun run lint`: passes.
- `bun run build`: passes; generated initial HTML contains copy without a runtime content fetch.
- `bun run build:preview`: passes into separate `dist-preview/`; backend supplies its own temporary output directory.
- Final embedded preview check: real backend build and authenticated iframe loaded, live draft title update acknowledged, published JSON unchanged, desktop screenshot inspected, no overflow/errors at 1280px and 390px. Browser coverage kept compact at the user's request.
- agent-browser acceptance completed by the primary agent after escalation: screenshots at desktop 1280px/mobile 390px inspected, no horizontal overflow; registration against a local mock API reached `/registered/?userId=999` with exact payload `{name:"Browser Test",email:"browser@example.test",address:"",birthday:""}`; unaffected subscription choices verified. Initial restricted agent environment could not bind sockets; no production API was touched.

## Follow-up content simplification: completed

Metadata, branding, and plan labels are no longer in editable JSON. Existing
title/social metadata and logos remain fixed in markup; membership labels use
the existing shared helper. The editor displays Join Pane and puts Footer after
Page Sections. Old browser drafts are adapted by the admin client without losing
editable text. Site validation/rendering/message tests now total 13 (60 assertions);
lint, normal build, and preview build pass. The primary agent verified the editor
layout and publish-confirmation flow with a mock publisher and compact browser
checks; no production content was published.

## Remaining limits

The generic image layout preserves existing asset sizing but arbitrary new copy can change page height. Asset existence is checked by the backend image picker/publishing boundary; the site validator restricts paths syntactically. No production GitHub push/Pages deployment was tested. Other pages and image uploads remain deferred.

## Editor scope refinement

Removed metadata, branding, and planLabels from the editable document and strict schema. The original site/social title and metadata remain in `index.html`; logo labels and alt text stay in the renderer; initial-page plan labels reuse `member.ts`. Preview uses the fixed site title. Existing drafts containing the removed groups require discarding or migration by the admin editor before publication.
