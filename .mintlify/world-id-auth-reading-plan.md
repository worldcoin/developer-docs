# IDP reading improvements

## Scope

Prepare a draft follow-up to #225. Ship the faithful migration first; review these presentation changes separately afterward. The source baseline remains temporal-apps commit `9eedf2dee3a8fb1d864e02c59a98982a2c811e61`.

## Implementation

- Add a deterministic presentation adapter to the existing publisher. Keep guide contracts canonical and preserve existing anchors. Regenerate instead of editing generated pages.
- Reuse native cards, code groups, tabs, notes, local images and Mermaid sequence diagrams. Keep site styles unchanged.
- Separate the device tutorial from the browser page, leaving the old device anchors as links. Publish complete coding-agent instructions on a reference route and point the agent Markdown prompt there.
- Add task-specific snippets for route selection, registration prerequisites, worked browser integration, freshness, HITL, XAA, testing and connection management.
- Use the four real portal screenshots recorded in `.mintlify/world-id-auth-screenshots.json`. Keep instructions before the form and settings images, use short captions and native image markup, and distinguish the empty developer-connections state from a successful connection. Never publish credentials, account identity or submitted example settings. Mobile sandbox capture requires the actual app.
- Document the source/presentation boundary and follow-up release order.

## Verification

Run the converter tests, deterministic source comparison, MDX parsing when the existing runtime is available, and diff checks within two minutes total. Skip browser QA and full builds. Commit and push only this new branch; open a draft against the migration branch without updating #225.
