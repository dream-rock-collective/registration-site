# Main-page editor: uploads and discoverability

Status: planned; no feature implementation in this branch.

Future branch: `feature/main-page-editor`. Future PR: **Main-page editor: uploads and discoverability** against `main`. [Backend plan](https://github.com/dream-rock-collective/drc-backend/blob/plans/docs/plans/active/main-page-editor.md)

Make existing landing-page content controls easy to find and allow uploaded images in content sections. Keep current layout; no visual page builder.

## Baseline and dependencies

The `editor` branch already has editable join/member/messages/footer copy, reorderable rich-text sections, existing-image selection, draft persistence and preview. These changes are absent from this plan branch's `main` baseline. Merge the existing editor work in both repositories before implementing this feature; do not recreate it.

## Implementation

- Label the landing-page selection “Main page” in admin. Reuse existing section image `{src, alt}` data and existing rich-text validation.
- Backend implements authenticated image staging/upload, asset preview, and publication in the paired plan. Upload returns a root-relative site asset path; selecting it changes the same section image field as the existing picker. Require meaningful editable alt text.
- Reuse the same uploaded-asset path and preview mechanism for the later mail-art gallery. Keep images in the site repository, publish referenced assets together with content, and do not overwrite existing asset paths.
- Registration-site changes are limited to resolving uploaded assets in production and preview if the existing root-relative handling needs adjustment. No registration or payment behavior changes.

## Acceptance and verification

Upload an image, choose it for a main-page section, edit alt text, reload the draft, preview, and publish; the image must display on desktop/mobile and after deployment. Existing assets still work. Failed upload or stale revision must preserve the saved content; abandoned drafts must not change the public site. Cover uploaded preview paths and content round-trip in existing content/preview tests. Run build and lint when code is later implemented.

## Rollout

Merge editor prerequisites, then backend upload support plus any necessary public preview changes before enabling the upload button. No new public content field is needed.
