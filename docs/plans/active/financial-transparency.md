# Editable financial transparency section

Status: planned; no feature implementation in this branch.

Future branch: `feature/financial-transparency`. Future PR: **Editable financial transparency section** against `main`. [Backend plan](https://github.com/dream-rock-collective/drc-backend/blob/plans/docs/plans/active/financial-transparency.md)

Add a financial transparency title and body directly on the “You’re Subscribed” donation screen. Admins manually write updates such as amounts donated in October and September; no separate page or automatic financial calculations.

## Dependencies and interface

Build on [donation-page editing](donation-page-editor.md). Extend donation content with optional `transparency: {title, body}`; body uses the existing allowed rich-text grammar. Default to empty values and omit the section until content is supplied. Reject a body without a title. Amounts and dates are authored text, not payment-derived data.

## Implementation

- Add title and rich-text controls under Donation page in admin through the paired backend feature. Reuse draft, preview, review and publication rather than a separate workflow.
- Render the section below donation allocation controls and above the footer with a semantic heading. It remains visible after successful allocation and on reload of the subscribed screen.
- Reuse the same renderer in safe preview. This text is public static content; do not present browser-local member state as access control or put private financial/member data in it.

## Acceptance and verification

Test old content and empty section, title/body validation, rich-text safety, preview/public parity and published updates. Verify desktop/mobile readability and that allocation success/error handling still works with the section present. Ensure no fabricated donation amounts are seeded.

## Rollout

Deploy optional-field validation and rendering before enabling admin edits. Seed no financial figures; the site owner supplies the initial text.
