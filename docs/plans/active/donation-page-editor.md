# Donation-page content editing

Status: planned; no feature implementation in this branch.

Future branch: `feature/donation-page-editor`. Future PR: **Donation-page content editing** against `main`. [Backend plan](https://github.com/dream-rock-collective/drc-backend/blob/plans/docs/plans/active/donation-page-editor.md)

Expose the donation/subscribed screen at `/allocate-payment/` as “Donation page” in the admin editor, alongside “Main page”. Admins edit text, links and images within the current layout.

## Baseline and dependencies

Merge the existing `editor` work in both repositories first. The donation page is currently static HTML with behavior in `src/allocate-payment.ts`; only the landing page has a content renderer and safe admin preview. This feature does not change donation amounts or organization identities.

## Implementation

- Extend the existing editable content document with an optional `donation` object containing the current donation-page headings, explanatory rich text, button/status labels, footer and image fields. Define a typed interface from the actual current markup; initialize defaults from existing copy and keep older documents valid by supplying those defaults.
- Extract donation markup into a renderer shared by the real page and preview. Preserve IDs and data hooks consumed by allocation code, and existing template variable validation. Organization data stays hardcoded until its separate feature.
- Extend preview messages with an explicit page selector (`main` or `donation`, default `main`) and use the same validation and trusted parent/token checks. Donation preview contains sample member/allocation state and imports no payment, registration, submission or member-storage code.
- Paired backend work adds the page selector and donation controls to the existing drafts, review and publication flow. Keep one document revision so editing either page cannot overwrite concurrent changes unnoticed.

## Acceptance and verification

Editing donation copy must change donation preview and deployed donation page without changing payment/registration behavior. Test old content defaults, valid/invalid rich text and links, page-specific rendering, draft round-trip and preview message validation. Confirm preview cannot submit requests or mutate member storage; check desktop/mobile and existing main-page preview.

## Rollout

Deploy the compatible content validator and donation renderer before enabling new admin fields. Subsequent financial transparency and organization plans build on this interface.
