# Frontend feature plans

These documents specify future work only. The `plans` branch is based on `main`; it does not implement features or merge the existing `editor` branch. Each feature gets its own future branch and PR. Cross-repository features get one linked PR per repository, not one combined PR.

| Feature | Future branch | PR boundary |
| --- | --- | --- |
| [Main-page editor: uploads and discoverability](main-page-editor.md) | `feature/main-page-editor` | Linked PRs in both repositories |
| [Donation-page content editing](donation-page-editor.md) | `feature/donation-page-editor` | Linked PRs in both repositories |
| [Monthly mail-art gallery](mail-art-gallery.md) | `feature/mail-art-gallery` | Linked PRs in both repositories |
| [Allocate donations by percentage](percentage-allocation.md) | `feature/percentage-allocation` | Linked PRs in both repositories |
| [Editable financial transparency section](financial-transparency.md) | `feature/financial-transparency` | Linked PRs in both repositories |
| [Manage donation organizations safely](organization-management.md) | `feature/organization-management` | Linked PRs in both repositories |
| [Larger About the Artist image](artist-image-size.md) | `feature/artist-image-size` | registration-site only |

## Dependencies and order

1. Merge the existing editor work in both repositories first. Its content schema, rendering, safe preview, drafts and Git publication are prerequisites, not new features to duplicate.
2. Main-page uploads and donation-page editing can proceed separately. Gallery reuses main-page uploads; transparency and organization management reuse donation-page editing.
3. Percentage allocation needs backward-compatible backend unit storage/display before frontend release. Organization management must preserve permanent keys and tolerate historical allocations. Either may ship first if their compatibility contracts are maintained.
4. Artist sizing is an independent public-site change. Admin exports are independent backend/admin work; see the [backend plan index](https://github.com/dream-rock-collective/drc-backend/blob/plans/docs/plans/active/README.md).

## Chosen defaults

- Gallery groups contain 1–3 images, newest month first; mobile stacks the selected month's images. No autoplay.
- Percentage interaction retains drag/drop using twenty 5% tokens. Missing allocation units mean historical dollars.
- Transparency appears directly on the subscribed screen and is manually authored.
- Editing covers content, links and images within existing layouts, not a visual layout builder.
- Documents describe tests to run during implementation; this documentation branch needs link/content review and `git diff --check`, not runtime tests.

Cross-repository links target the requested `plans` branches. Feature implementers should update authoritative docs for changed behavior and remove/archive these active plans when delivered.
