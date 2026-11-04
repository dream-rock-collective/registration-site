# Allocate donations by percentage

Status: planned; no feature implementation in this branch.

Future branch: `feature/percentage-allocation`. Future PR: **Allocate donations by percentage** against `main`. [Backend plan](https://github.com/dream-rock-collective/drc-backend/blob/plans/docs/plans/active/percentage-allocation.md)

Members distribute 100% of the existing donation portion among organizations. Keep drag/drop, touch and click/keyboard alternatives. Payment prices and the portion donated do not change.

## Interface and compatibility

Treat the new interaction as twenty 5% tokens. Total assigned percentage must be exactly 100 before submission. Keep the allocation map keyed by permanent organization IDs and add `allocationUnit: "percent"` to submission and saved member state. Historical payloads/rows without a unit remain dollars; never infer units from the total or rewrite past values. Paired backend work adds explicit storage/read/admin display support before this frontend submits percentages.

## Implementation

- Replace plan-dollar token count with twenty percentage tokens; adapt drag/drop and touch hit testing, plus controls, reset, random distribution, remaining amount and status labels. All operations move multiples of 5 and preserve a 100% total capacity.
- Keep existing user identifiers, request error/retry handling and eligibility flow. Preserve plan labels and donation explanatory copy; remove dollar-unit assumptions from allocation messages only.
- In `src/member.ts`, store the unit with the allocation. Restore only valid percent maps for currently active organization IDs, nonnegative 5% increments and total 100. Legacy dollars or retired-recipient preferences stay intact in history but start a fresh unassigned selection; explain that a new preference is needed. Never silently resubmit converted dollars.
- The backend remains authoritative for request validation. Admin views and JSON responses carry the unit so old dollars never display as percentages.

## Acceptance and verification

Test token conservation, reset/random distribution, moves between recipients, blocked partial submission, exact 100 submission, payload unit, reload, legacy dollars, changed recipients, failed submission and retry. Verify drag, touch, keyboard/click controls and accessible remaining-percentage announcements. Update the allocation API and site-overview docs alongside implementation.

## Rollout

Deploy backward-compatible backend unit support first, then frontend. Older clients can still submit dollars. Coordinate with organization management for active IDs; do not release a percent UI against a dollar-only backend.
