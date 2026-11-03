# Manage donation organizations safely

Status: planned; no feature implementation in this branch.

Future branch: `feature/organization-management`. Future PR: **Manage donation organizations safely** against `main`. [Backend plan](https://github.com/dream-rock-collective/drc-backend/blob/plans/docs/plans/active/organization-management.md)

Allow admins to add organizations and edit their display content or retire them. A replacement gets a new permanent key; historical allocations retain the organizations originally selected.

## Dependencies and interface

Build on [donation-page editing](donation-page-editor.md). Add donation organization records with immutable `id`, `name`, safe `url`, rich-text `description` and `active` flag. Seed existing organizations using their exact existing keys. Generate a new UUID once when creating an organization; hide keys from ordinary editing. Retirement sets inactive rather than deleting records; replacements always create a new record.

## Implementation

- Replace hardcoded columns, labels and dialogs with content-driven active organizations. Preserve shared allocation input hooks and controls. Require at least one active recipient before publication; do not impose the current three-column count as a data limit.
- Retain inactive metadata for historical display. Historical entries retain their original raw key as a fallback; do not add name snapshots in v1. Do not relabel or migrate historical JSON keys when names change.
- On loading saved preferences, validate keys against the active set. If any selected recipient has retired, show a notice and start an unassigned new allocation; preserve existing stored/server history and require explicit resubmission.
- Backend editor enforces immutable IDs across publication revisions and includes organization edits in normal review. Validate URLs, rich text and images at the content boundary. The allocation API remains generic about recipient keys; frontend reload validates saved selections against the published active set. Server-side recipient allowlisting is outside this feature.

## Acceptance and verification

Add/edit/retire/replace a recipient and confirm replacement ID differs. Test old seed IDs, duplicate IDs, no active recipients, safe links, historical label/key fallback, changed organization sets on reload and stale submission. Verify new allocation supports variable recipient counts on desktop/mobile and keyboard/touch input.

## Rollout

Deploy compatible content validation and frontend dynamic rendering before exposing organization controls. Preserve the existing organizations until an admin explicitly changes them. Coordinate percentage-unit support without converting old values.
