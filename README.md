# Dream-Rock Collective registration site

Public frontend for Dream-Rock Collective. The backend and Docker deployment live in the separate `drc-backend` repository.

## Local development

Set `VITE_API_BASE_URL` to override the backend URL when needed. If it is not
set, local development uses `http://localhost:6942` and production uses
`https://api.dreamrock.co`.

```sh
bun install
bun run dev
```

## Build

```sh
bun run build
```

The production build is written to `dist/`.

The payment pages are available at `/registered/`, `/success/`, and
`/allocate-payment/`. Configure the backend Checkout `success_url` to use
`/allocate-payment/` and the `cancel_url` with the appropriate payment page.
