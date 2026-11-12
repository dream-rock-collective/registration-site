# Site Overview

## User journey

```text
/                         registration form
  -> /registered/          subscription selection
  -> Stripe Checkout       external payment page
  -> /success/             simple payment-success landing page
  -> /allocate-payment/    choose where the community allocation goes
```

The Stripe Checkout success URL is expected to return to `/allocate-payment/`. The separate `/success/` page remains available as a simple success destination and completes any locally stored pending plan.

## Routes and responsibilities

### `/`

The landing page explains the mail club, the collective, the artist, and frequently asked questions. Its registration form calls `GET /health` before enabling submission, then calls `POST /register`. A successful registration is stored in browser local storage and the visitor is sent to `/registered/?userId=<id>`.

### `/registered/`

This page presents the three plans and starts Stripe Checkout through `POST /create-checkout-session`. The user id comes from the query string. Before leaving for Stripe, the selected plan and user id are stored as a pending plan in local storage.

Current plans are:

| Plan | Display price | Allocation bubbles |
| --- | ---: | ---: |
| `once` | $12 | 5 × 20% |
| `monthly` | $10/mo | 5 × 20% |
| `yearly` | $110/yr | 5 × 20% |

### `/success/`

This is a minimal landing page. Its script calls `completePendingPlan()` so a successful checkout can update the browser's member record.

### `/allocate-payment/`

This page lets a paid member distribute 100% of their donation share among:

- `weAllWeGotSd`
- `indigenousClimateAction`
- `otayMesaDetentionResistance`

Members can click the plus controls, drag available 20% bubbles, move allocated bubbles between organizations, distribute bubbles randomly, or reset the current selection. Submit is enabled only when all five bubbles are allocated. Submission calls `POST /submit-allocation` with the newest stored member's user id and `format: "percentage"`. After a successful submission, the allocation is saved locally and restored whenever that member's allocation page is loaded.

Only saved percentage allocations totaling 100 in multiples of 20 with current recipient keys are restored. Legacy dollars and invalid selections start fresh with an explanation; storage is replaced only after a successful submission. Allocation controls are locked while submitting and failures retain the selection for retry.

If no paid member is available in local storage, the page displays a “No payment received” state and disables allocation controls.

## Browser state

`src/member.ts` owns the local storage schema:

- `dream-rock-member` stores an array of registered members. Each member includes the visitor name, plan, user id, registration date, optional payment date, and optional saved allocation with `allocationFormat`. `getMember()` sorts this table by registration date descending and returns the newest member. Existing single-member objects and old `registrationId` fields are migrated when read for backwards compatibility.
- `dream-rock-pending-plan` stores the plan and user id selected immediately before Stripe Checkout, so payment completion updates the correct member. If no id is present in older storage, the newest member is used.

The initial registration has plan `free`. `completePendingPlan()` promotes the matching member to the pending paid plan and records the current browser time as `paymentDate`. This is display state only; payment authorization is enforced by the backend.

## Product behavior to preserve

- The registration API must be healthy before the landing-page form can be submitted.
- The user id must survive the transition from `/` to `/registered/` and then into allocation submission.
- The backend accepts allocation objects generically, but the frontend currently controls the organization keys and 20% increments; percentage totals must equal 100.
- Allocation submissions are historical and immutable. A later submission creates another record rather than editing the previous one.
- The mailing address is optional for registrations. Birthday is optional and is raw text for the bonus birthday letter.
