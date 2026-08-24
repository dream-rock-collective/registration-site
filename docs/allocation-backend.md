# Allocation backend contract

The allocation page submits a subscriber's nonprofit allocation after Stripe
payment completes. The frontend currently calls:

`POST https://api.dreamrock.co/submit-allocation`

## Required data

The initial `POST /register` response must include a stable identifier. The
frontend accepts `registrationId`, `id`, or `registration.id`, persists that
value in local storage, and sends it as `userId`.

The allocation budget is currently determined by the selected plan on the
frontend:

- `once`: 6 dollars
- `monthly`: 5 dollars
- `yearly`: 5 dollars

The backend should eventually derive the amount from the verified payment or
subscription record instead of trusting the browser.

## Submit request

```json
{
  "userId": "registration-id",
  "allocation": {
    "weAllWeGotSd": 2,
    "indigenousClimateAction": 2,
    "otayMesaDetentionResistance": 2
  }
}
```

Allocation values are whole-dollar nonnegative integers. The backend should
verify that the user exists, the payment is complete, the organization keys
are valid, and the allocation total matches the verified plan budget.

## Response

Return a 2xx response when the allocation has been stored or correlated with
the subscriber. A JSON response may include an `allocationId` for future
receipt or support workflows:

```json
{
  "allocationId": "allocation-id"
}
```

Return a useful `error` string and a suitable 4xx status for invalid data or
unknown users. The frontend displays that error and allows the subscriber to
retry.

## TODO

- Correlate allocations with the registration/user and verified Stripe payment.
- Decide whether allocations are immutable records or an updatable current
  preference.
- Define idempotency behavior for retries and duplicate submissions.
- Return the canonical subscription type and verified allocation budget from
  the backend so the frontend does not need to infer them from local storage.
