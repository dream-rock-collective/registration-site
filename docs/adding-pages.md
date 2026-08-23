# Adding a New Page

This project uses static HTML entry points with shared styles in `src/style.css`. New pages should look like part of the same site, so reuse the existing structure and classes before adding page-specific CSS.

## Page setup

1. Add a new HTML entry point at the page URL, for example `about/index.html`.
2. Add the entry point to `vite.config.ts` under `build.rollupOptions.input`.
3. Import the shared stylesheet through the page’s TypeScript entry file:

   ```ts
   import "./style.css";
   ```

4. Keep page behavior in a dedicated `src/<page>.ts` file. Do not duplicate checkout, member, or shared form logic.

## Required layout structure

Use `.site-shell` as the page-level wrapper:

```html
<main class="site-shell">
  <!-- optional shared cloud images -->
  <section class="card-section">
    <div class="card-block">
      <!-- page content -->
    </div>
  </section>

  <section class="content-section">
    <!-- page copy -->
  </section>
</main>
```

Use these shared classes whenever they fit the page:

- `.site-shell` provides the blue background, page positioning, overflow handling, and full-height layout.
- `.card-section` centers a card section and provides its surrounding spacing.
- `.card-block` provides the standard white card, border, width, padding, and minimum height.
- `.content-section` provides the standard centered text-column width.
- `.content-section`, `.mail-drops`, `.artist`, and `.faq` are the preferred content-section patterns for common page layouts.
- `.cloud` and the existing `.cloud-a` through `.cloud-aa` classes provide the shared cloud artwork and positioning.

Do not create a second version of `.card-block` with a different width or typography just to fit a new page. Add a modifier class only for a genuine behavior difference, and keep the shared class responsible for the common visual system.

## CSS reuse rules

- Put shared typography, spacing, buttons, cards, and content widths in the base section of `src/style.css`.
- Reuse the global `h1`, `h2`, `p`, `ul`, button, and card rules instead of assigning page-specific font sizes.
- Prefer equal spacing values such as `padding: 16px` or `margin: 16px` when all sides are intended to match.
- Use directional or unequal values only when they represent a deliberate layout relationship, such as a cloud offset or a section positioned below a hero.
- Keep page-specific selectors grouped together and name them after the page or component, such as `.subscription-page` or `.plan-list`.
- Avoid inline styles and avoid copying the main page’s CSS into a new page block.

## Responsive breakpoints

Use the project’s two breakpoint responsibilities consistently:

- `450px` is the primary breakpoint for most elements. Use it for card widths, typography, form controls, content stacking, and general mobile layout changes.
- `700px` is reserved for cloud behavior. Use it for cloud sizes, cloud positions, and other cloud-only responsive adjustments.

Keep media-query rules together at the end of the stylesheet. Do not add a new scattered media query beside an individual component unless there is a documented reason.

## Before submitting a page

Run:

```bash
npm run format
npm run lint
npm run build
```

Check the page at desktop width and at a narrow mobile width. Confirm that the new page reuses the shared card/content dimensions, that clouds do not cover readable content, and that existing pages remain unchanged.
