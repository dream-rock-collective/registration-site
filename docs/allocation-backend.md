# Allocation backend contract

Production API base URL: `https://api.dreamrock.co`.
Local API base URL: `http://localhost:6942`.

The frontend selects `VITE_API_BASE_URL` when set; otherwise it uses the local URL on localhost and the production URL on other hosts. The backend implementation and deployment live in the separate `drc-backend` repository. This document describes the contract the frontend relies on.

## Health check

`GET /health` is called by the landing page before enabling registration. The frontend considers the API healthy only when the response is successful and the JSON body contains `{ "status": "ok" }`. Network errors and any other response leave registration disabled.

## Registration

`POST /register` accepts:

```json
{
  "name": "Jordan Alvarez",
  "email": "jordan@example.com",
  "address": "123 Main St",
  "birthday": "April 12"
}
```

`name` and `email` are required. `address` is optional and may be `null` or
omitted; blank values are stored as `null`. `birthday` is optional and may be
`null`; when supplied it is stored as raw text, without date parsing. The
maximum birthday length is 100 characters.

The successful `201` response includes the stable registration identifier:

```json
{
  "registration": {
    "id": 42,
    "name": "Jordan Alvarez",
    "email": "jordan@example.com",
    "address": "123 Main St",
    "birthday": "April 12",
    "created_at": "2026-08-12T18:03:00.000Z"
  }
}
```

## Payment and allocation

`POST /create-checkout-session` accepts `{ "userId": 42, "plan":
"once" | "monthly" | "yearly" }` and returns `{ "url": "..." }`.

The frontend reads `userId` from `/registered/?userId=...`, sends the selected plan, saves the plan and user id locally, and redirects the browser to the returned Stripe URL. A missing URL or unsuccessful response is treated as a checkout error. The local member table may contain multiple registrations; page-level member access uses the newest registration by `registeredAt`.

After payment, Stripe returns the browser to `/allocate-payment/`. The
backend only accepts allocations after the signed Stripe webhook has marked
the registration as paid. The frontend owns the plan budget and total.

## Submit an allocation

```http
POST /submit-allocation
Content-Type: application/json
```

Request:

```json
{
  "userId": "42",
  "allocation": {
    "weAllWeGotSd": 2,
    "indigenousClimateAction": 2,
    "otayMesaDetentionResistance": 2
  }
}
```

`userId` is the user id returned by `/register`. `allocation` is a
generic JSON object whose keys and totals are controlled by the frontend. Each
value must be a whole, nonnegative number. The backend does not maintain a
charity allowlist, interpret charity keys, or calculate plan budgets.

Successful response (`201`):

```json
{ "allocationId": 17 }
```

Submissions are historical and immutable. Retrying or changing an allocation
creates another submission; it does not overwrite an earlier one. Invalid
input returns `400`, an unknown registration returns `404`, and an unpaid
registration returns `403`, each with an `error` string.

The frontend sends the user id as the `userId` string and owns the plan
budget and organization list. The backend validates numeric payload shape and
payment/registration status but does not calculate the budget or interpret the
organization keys.

## Admin allocation data

Authenticated `GET /registrations` includes the latest submission only:

```json
{
  "latest_allocation": {
    "weAllWeGotSd": 2,
    "indigenousClimateAction": 2,
    "otayMesaDetentionResistance": 2
  }
}
```

It is `null` when no submission exists. The response also includes `birthday`.

Authenticated `GET /registrations/:id/allocations` returns complete history:

```json
{
  "allocations": [
    {
      "id": 17,
      "allocation": { "weAllWeGotSd": 2, "indigenousClimateAction": 2 },
      "submitted_at": "2026-08-12T18:10:00.000Z"
    }
  ]
}
```

Authenticated `POST /modify-registration` accepts birthday edits and may
include an `allocation` object in edit data. An admin allocation edit is
validated for payload shape and appends a new immutable history entry.
