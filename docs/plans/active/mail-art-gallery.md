# Monthly mail-art gallery

Status: planned; no feature implementation in this branch.

Future branch: `feature/mail-art-gallery`. Future PR: **Monthly mail-art gallery** against `main`. [Backend plan](https://github.com/dream-rock-collective/drc-backend/blob/plans/docs/plans/active/mail-art-gallery.md)

Show past mail-club art between Mail Drops and About Dream-Rock. Each month has one to three uploaded images, one title and one caption. Show newest months first and navigate between monthly groups with a carousel.

## Dependencies and interface

Merge existing editor prerequisites and the [main-page upload feature](main-page-editor.md). Add optional `mailArt` groups to editable site content, defaulting to an empty list for old documents. Each group has a unique `month` in `YYYY-MM`, `title`, plain-text `caption`, and `images: {src, alt}[]` of length 1–3. Reject duplicate/invalid months, invalid paths, or missing image alt text. No donations or member data is involved.

## Implementation

- Render the gallery after the Mail Drops section and before About Dream-Rock using stable section identities, never by matching editable title text. Add internal section IDs with backwards-compatible defaults for existing sections so later title edits/reordering cannot silently move the gallery. Admin may reorder ordinary sections; the gallery retains this explicit insertion point.
- Sort groups by month descending at rendering. Show all images in the selected group; desktop uses up to three columns, mobile stacks images. Escape text and reuse existing image/path validation and shared layout styles.
- Add labeled previous/next buttons, month/title indication and keyboard access. Do not autoplay. Disable controls at ends; hide controls for one group and omit the whole gallery when empty. Preserve useful first-group content if scripting fails.
- Backend admin manages groups and uploads using the shared upload endpoint; drafts, preview and publication include all referenced assets. Do not build a second uploader.

## Acceptance and verification

Test empty/one/multiple months, year boundaries, duplicate months, one/two/three images, invalid paths, alt text and escaping. Verify newest-first order, insertion after title edits, carousel boundaries, keyboard controls, mobile stacking, and preview/public parity. Upload and publish a new month end-to-end; failed publication leaves prior content/assets available.

## Rollout

Deploy compatible content validation/rendering before enabling gallery controls in admin. No sample art or fabricated historical captions will be published.
