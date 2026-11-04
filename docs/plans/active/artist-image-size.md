# Larger About the Artist image

Status: planned; no feature implementation in this branch.

Future branch: `feature/artist-image-size`. Future PR: **Larger About the Artist image** against `main`. No paired backend PR.

Enlarge the About the Artist image to the existing normal content-section image size, with no new sizing controls or layout system.

## Implementation

The current editor branch applies an asset-specific override limiting `/leeya-appleby.jpeg` to 110×160. After merging that editor work, remove that override so the image uses the shared section rules (approximately 240×240 desktop and 220×190 mobile), preserving aspect ratio and existing fitting behavior. Inspect matching legacy artist-image rules so the actual rendered route is updated once rather than accumulating overrides.

No backend change, content migration or new image asset is needed. This remains a separate small feature PR even if main-page upload work is already underway.

## Acceptance and verification

Build and lint; visually check the actual artist section at desktop and narrow mobile sizes. Confirm image is larger, does not stretch/overflow or hide copy, and other section images keep their current sizing. No new unit test is needed for a CSS-only adjustment.

## Rollout

Can ship independently after the editor prerequisite; deploy via the normal registration-site workflow.
