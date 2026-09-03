# Architecture

## Repository layout

```text
index.html                         landing-page HTML entrypoint
newsletter-thanks/index.html      newsletter confirmation entrypoint
registered/index.html              subscription-selection entrypoint
success/index.html                 success entrypoint
allocate-payment/index.html        allocation entrypoint
src/main.ts                        landing-page behavior
src/newsletter-thanks.ts           newsletter confirmation behavior
src/registered.ts                  checkout behavior
src/success.ts                     success-page state completion
src/allocate-payment.ts            allocation behavior
src/member.ts                      shared local-storage state
src/style.css                      shared and page-specific CSS
public/                            images, fonts, icons, and other static assets
vite.config.ts                     Vite multi-page input configuration
.github/workflows/                 GitHub Pages build and deployment
```

## Build model

Vite treats each HTML file listed in `vite.config.ts` as a separate Rollup input. Each page loads one TypeScript entry module with a `<script type="module">` tag. The TypeScript modules import `src/style.css` where styling is needed.

Adding a directory and an HTML file is not sufficient for a production build: the new HTML entry must also be added to `build.rollupOptions.input`. See [Adding a New Page](adding-pages.md) for the complete process.

## Runtime module responsibilities

- `main.ts` checks API health, validates and submits registration data, saves the registration locally, and navigates to subscription selection.
- `registered.ts` reads the user id from the URL, starts checkout, and saves the pending plan with that member id.
- `success.ts` completes the pending plan locally.
- `allocate-payment.ts` computes the plan budget, restores/renders/edits the allocation, submits it, and saves successful choices locally.
- `member.ts` is the shared browser-state helper. It stores the member table, selects the newest registration, associates pending plans with user ids, and persists allocations. Keep local-storage reads/writes there rather than duplicating the schema in page modules.

## Styling model

`src/style.css` contains the shared visual system first: body defaults, typography, cards, content sections, buttons, clouds, and responsive rules. Subscription and allocation styles appear later as page-specific sections.

Prefer existing classes such as `.site-shell`, `.card-section`, `.card-block`, `.content-section`, `.cloud`, and `.subscription-page`. The primary general responsive breakpoint is `450px`; `700px` is reserved for cloud behavior. Keep media queries at the end of the stylesheet.

## Static assets

Files in `public/` are served from the site root. For example, `public/rock.png` is referenced as `/rock.png`, and `public/whats-included/collage.png` is referenced as `/whats-included/collage.png`. Fonts, logos, cloud art, backgrounds, and page imagery all follow this convention.

Use meaningful alt text for informative images and empty alt text for decorative cloud/branding images when the surrounding markup already provides the accessible label.

## API URL selection

The page modules use `VITE_API_BASE_URL` when provided. Without it, localhost and `127.0.0.1` use `http://localhost:6942`; other hosts use `https://api.dreamrock.co`. This value is bundled into the frontend at build time.
