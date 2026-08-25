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

The landing page explains the mail club, the collective, the artist, and frequently asked questions. Its registration form calls `GET /health` before enabling submission, then calls `POST /register`. A successful registration is stored in browser local storage and the visitor is sent to `/registered/?registrationId=<id>`.

### `/registered/`

This page presents the three plans and starts Stripe Checkout through `POST /create-checkout-session`. The registration id comes from the query string. Before leaving for Stripe, the selected plan is stored as a pending plan in local storage.

Current plans are:

| Plan | Display price | Allocation budget |
| --- | ---: | ---: |
| `once` | $12 | $6 |
| `monthly` | $10/mo | $5 |
| `yearly` | $110/yr | $5 |

### `/success/`

This is a minimal landing page. Its script calls `completePendingPlan()` so a successful checkout can update the browser's member record.

### `/allocate-payment/`

This page lets a paid member distribute the plan budget among:

- `weAllWeGotSd`
- `indigenousClimateAction`
- `otayMesaDetentionResistance`

Members can click the plus controls, drag available dollars, distribute dollars randomly, or reset the current selection. Submit is enabled only when the full budget is allocated. Submission calls `POST /submit-allocation` with the stored registration id.

If no paid member is available in local storage, the page displays a “No payment received” state and disables allocation controls.

## Browser state

`src/member.ts` owns the local storage schema:

- `dream-rock-member` stores the visitor name, plan, registration id, and optional payment date.
- `dream-rock-pending-plan` stores the plan selected immediately before Stripe Checkout.

The initial registration has plan `free`. `completePendingPlan()` promotes it to the pending paid plan and records the current browser time as `paymentDate`. This is display state only; payment authorization is enforced by the backend.

## Product behavior to preserve

- The registration API must be healthy before the landing-page form can be submitted.
- The registration id must survive the transition from `/` to `/registered/` and then into allocation submission.
- The backend accepts allocation objects generically, but the frontend currently controls the organization keys and total budget.
- Allocation submissions are historical and immutable. A later submission creates another record rather than editing the previous one.
- The mailing address is required because it is used for mail drops. Birthday is optional and is raw text for the bonus birthday letter.
