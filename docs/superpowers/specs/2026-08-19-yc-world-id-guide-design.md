# World ID for YC Startups: Design

## Goal

Create a direct-link-only page for YC founders that explains the simplest safe path to add World ID, with familiar startup use cases and clear links to the full reference documentation.

## Location and visibility

- Add `world-id/yc.mdx`, served at `/world-id/yc`.
- Set `hidden: true` in frontmatter and do not add it to `docs.json` navigation.
- The page remains reachable by its direct URL but is not promoted in navigation or indexed.

## Content

1. Frame World ID as a privacy-preserving proof that one unique human is taking an action.
2. Help founders decide when to use it: anti-bot signup, referral and reward abuse, one-person allocations or votes, and community or marketplace trust.
3. Describe the shortest production flow without duplicating the full implementation guide:
   - Create an app, RP, and action in the Developer Portal.
   - Add the IDKit React widget using the Proof of Human flow.
   - Generate the RP signature only on the backend.
   - Forward the result unchanged to the World ID verification endpoint from the backend.
   - Store the returned nullifier with a uniqueness constraint.
4. Include a small, actionable React outline and link to the existing integration guide for complete code.
5. Add short use-case examples for AI consumer products, marketplaces, rewards and referrals, communities, and crypto.
6. Close with optional next steps for stronger or broader trust signals: user presence and liveness, Identity Check, and AgentKit.

## Constraints

- Use only current IDKit 4.x terminology and the current Developer Portal flow.
- Do not include secret material or client-side signing guidance.
- Keep the page focused on Proof of Human; the other products are follow-on links, not parallel tutorials.
- Reuse existing internal documentation links wherever detailed integration material exists.

## Validation

- Run the repository spellcheck and broken-link checks.
- Confirm the new page is not listed in `docs.json` and has `hidden: true` frontmatter.
