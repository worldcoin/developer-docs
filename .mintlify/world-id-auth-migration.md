# World ID Auth source and cutover map

This maintenance note records the twelve-page migration into the `World ID Auth` tab. It is not a public integration guide or evidence of a deployed cutover.

## Source snapshot

- Repository: `worldcoin/temporal-apps`.
- Reviewed commit: [`9eedf2dee3a8fb1d864e02c59a98982a2c811e61`](https://github.com/worldcoin/temporal-apps/tree/9eedf2dee3a8fb1d864e02c59a98982a2c811e61).
- The full overview and eleven guide sources were reviewed before migration. The scope includes all ten existing public integration guides and the approved public adaptation of `world-id-users.md`.
- Keep the source Markdown canonical until the shared browser/MCP publication contract is explicitly changed. The migrated MDX is an adaptation of that text, not an independent API contract.

The publication contract is documented in the [IdP API README](https://github.com/worldcoin/temporal-apps/blob/9eedf2dee3a8fb1d864e02c59a98982a2c811e61/apps/idpapi/README.md#developer-integration-guides). The [portal renderer](https://github.com/worldcoin/temporal-apps/blob/9eedf2dee3a8fb1d864e02c59a98982a2c811e61/apps/idpportal/vite.config.ts) reads the guide Markdown, substitutes the environment issuer, and publishes browser pages. MCP embeds the guide sources in the API binary. Publishing here does not update either deployment.

## Twelve-page coverage

Destination paths below are relative to the repository root and resolve under `https://docs.world.org/` without the `.mdx` extension.

| Canonical source | Destination | Required coverage |
| --- | --- | --- |
| [docs.html][overview-source] | `world-id-auth/overview.mdx` | Human continuity; all five use cases; private recognition and sectors; fresh authentication; World ID and OIDC explanation; integration paths; standards; portal, playground, and legal links. |
| [getting-started.md][quickstart-source] | `world-id-auth/quickstart.mdx` | How it works; four integration steps; device freshness and XAA consent distinction; environment values; IDKit differences; legacy sign-in deprecation; coding-agent entry point. |
| [app-registration.md][registration-source] | `world-id-auth/app-registration.mdx` | Eligibility; exact callbacks; client authentication; credentials and rotation; managed and legacy sectors; sharing and account linking; coding-agent setup; benefit listing publication. |
| [oidc.md][oidc-source] | `world-id-auth/connect-your-backend.mdx` | OIDC configuration; browser flow; token validation; client authentication; complete device profile and examples; expiry and rate limits; XAA; recovery; primary sign-in; limitations; troubleshooting. |
| [federation.md][federation-source] | `world-id-auth/connect-your-auth-server.mdx` | Auth-server configuration; MCP federation and diagram; identity mapping; recent authentication; verification and revocation boundaries. |
| [id-token.md][token-source] | `world-id-auth/id-tokens-and-identity.mdx` | Token response; decoded JWT; complete claims table; inbox email behavior; UserInfo; expiry and revocation limitations; safe subject storage and matching. |
| [step-up.md][step-up-source] | `world-id-auth/step-up.mdx` | Who may authorize; implementation; request parameters; Face Auth; default verification preferences; assurance; authorization boundaries; stale and duplicate operations; auth-server propagation; RFC 9470. |
| [human-in-the-loop.md][hitl-source] | `world-id-auth/human-in-the-loop.mdx` | Fresh human authentication; optional application-owned action approval; headless agents. Sidebar title: `Human in the loop`. |
| [xaa.md][xaa-source] | `world-id-auth/xaa.mdx` | Requirements; authorization-server metadata and configuration; app enrollment; agent connection; consent and access management. Sidebar title: `Cross App Access (XAA)`. |
| [world-id-users.md][users-source] | `world-id-auth/use-world-id-with-your-agent.mdx` | Authorized capabilities and limits; Orb lookup; benefits; partner claiming and confirmation; connection lifetime, refresh, revocation, and separate developer connections. |
| [coding-agent-setup.md][coding-source] | `world-id-auth/build-with-a-coding-agent.mdx` | Prompts; connection instructions; CLI examples; connection checks; complete agent instructions; portal permission; app registration and configuration; benefit listing publication. |
| [testing.md][testing-source] | `world-id-auth/testing.mdx` | Sandbox and playground; app setup; sandbox identity creation; a complete real flow; failure paths. |

The federation illustration moves from the source guide's `/portal/assets/mcp-federation.svg` reference to `images/docs/world-id-auth/mcp-federation.svg`. Keep the image and its explanatory alt text with the federation guide.

## Adaptation rules

Preserve content rather than summarizing guide bodies. Titles, frontmatter, MDX syntax, documentation links, and page layout may change to fit Mintlify. Preserve examples, tables, link destinations, and section meaning. Keep every subsection, including those not named in the sidebar.

Use the complete Markdown for `coding-agent-setup`. The current Auth browser renderer cuts its content at `## Agent instructions`, hiding that section and everything after it. The raw Markdown and MCP guide include the complete content. Keep the agent instructions and later app-management sections available in the migrated page and its machine-readable form; update prompts to point to the complete migrated Markdown.

`world-id-users` contains general guidance, not private account data. Its public adaptation is explicitly included. Replace the opening assumption that the reader already authenticated with language describing what happens after connection. Its publication does not remove authorization from the original MCP guide or `get_world_id_account`.

## Environments and service URLs

The Auth site substitutes `{{issuer}}` during each environment build. Resolve production examples to `https://auth.world.org` and keep sandbox examples on `https://sandbox.auth.world.org`. Do not infer staging or local production behavior from the source snapshot. Preserve documented local/test values only where they are already part of the public integration instructions.

Only documentation links move to `docs.world.org/world-id-auth/`. Keep discovery, issuer, portal, OAuth, MCP, protected-resource metadata, consent, and connection-management URLs on their service origins. All credentials, registrations, and discovery metadata used together must belong to the same environment. Preserve standards and other external reference links.

Keep Auth's `llms.txt`, public guide discovery, and the complete coding-agent instructions usable during transition. The new pages should be discoverable through the official site's existing documentation index and MCP. Do not confuse the read-only World Docs MCP with either Auth MCP service.

## Legacy URL cutover map

This is a mapping for a later Auth deployment. This migration does not install redirects on `auth.world.org`, change its CloudFront routes, remove old pages, or change MCP resource IDs.

| Existing Auth path | Proposed official docs destination |
| --- | --- |
| `/docs` and `/docs/` | `/world-id-auth/overview` |
| `/docs/guides` and `/docs/guides/` | `/world-id-auth/quickstart` |
| `/docs/guides/getting-started` | `/world-id-auth/quickstart` |
| `/docs/guides/app-registration` | `/world-id-auth/app-registration` |
| `/docs/guides/oidc` | `/world-id-auth/connect-your-backend` |
| `/docs/guides/federation` | `/world-id-auth/connect-your-auth-server` |
| `/docs/guides/id-token` | `/world-id-auth/id-tokens-and-identity` |
| `/docs/guides/step-up` | `/world-id-auth/step-up` |
| `/docs/guides/human-in-the-loop` | `/world-id-auth/human-in-the-loop` |
| `/docs/guides/xaa` | `/world-id-auth/xaa` |
| `/docs/guides/coding-agent-setup` | `/world-id-auth/build-with-a-coding-agent` |
| `/docs/guides/coding-agent-setup.md` | `/world-id-auth/build-with-a-coding-agent.md` |
| `/docs/guides/testing` | `/world-id-auth/testing` |

`world-id-users` has no existing public Auth page to redirect. Its new public destination is `/world-id-auth/use-world-id-with-your-agent`; the protected MCP resource remains separate.

Preserve existing section fragments at their mapped destinations. In particular, Auth has legacy OIDC fragment aliases `sign-in-through-the-browser` and `sign-in-a-headless-agent-device-flow` in addition to links using the current heading slugs. Preserve those aliases alongside `authenticate-through-the-browser` and `connect-a-headless-agent-device-flow`. Keep overview anchors such as `human-continuity`, `use-cases`, `pairwise-subjects`, `verification`, `powered-by-world-id`, `start-building`, and `standards` available.

## Maintenance handoff

Reuse the existing Mintlify Autopilot setup. The owner must grant its GitHub App access to `worldcoin/temporal-apps`, select it as additional source context, and apply the World ID Auth instructions in [AGENTS.md](AGENTS.md). Do not describe Auth maintenance as active until that connection and its behavior are confirmed. This PR does not add a custom synchronization workflow.

Review source changes against both the canonical guides and the implementation. Include the source PR and affected files in documentation PRs. Flag missing release evidence and source conflicts. Preserve maintenance of the rest of the site.

Before retiring Auth's existing browser documentation, agree on the shared source/publishing contract with its owner, deploy the legacy URL handling, and confirm that public Markdown, existing guide anchors, and MCP resources still resolve as intended. These are cutover tasks, not claims made by this migration.

[overview-source]: https://github.com/worldcoin/temporal-apps/blob/9eedf2dee3a8fb1d864e02c59a98982a2c811e61/apps/idpportal/docs.html
[quickstart-source]: https://github.com/worldcoin/temporal-apps/blob/9eedf2dee3a8fb1d864e02c59a98982a2c811e61/apps/idpapi/mcp/guides/getting-started.md
[registration-source]: https://github.com/worldcoin/temporal-apps/blob/9eedf2dee3a8fb1d864e02c59a98982a2c811e61/apps/idpapi/mcp/guides/app-registration.md
[oidc-source]: https://github.com/worldcoin/temporal-apps/blob/9eedf2dee3a8fb1d864e02c59a98982a2c811e61/apps/idpapi/mcp/guides/oidc.md
[federation-source]: https://github.com/worldcoin/temporal-apps/blob/9eedf2dee3a8fb1d864e02c59a98982a2c811e61/apps/idpapi/mcp/guides/federation.md
[token-source]: https://github.com/worldcoin/temporal-apps/blob/9eedf2dee3a8fb1d864e02c59a98982a2c811e61/apps/idpapi/mcp/guides/id-token.md
[step-up-source]: https://github.com/worldcoin/temporal-apps/blob/9eedf2dee3a8fb1d864e02c59a98982a2c811e61/apps/idpapi/mcp/guides/step-up.md
[hitl-source]: https://github.com/worldcoin/temporal-apps/blob/9eedf2dee3a8fb1d864e02c59a98982a2c811e61/apps/idpapi/mcp/guides/human-in-the-loop.md
[xaa-source]: https://github.com/worldcoin/temporal-apps/blob/9eedf2dee3a8fb1d864e02c59a98982a2c811e61/apps/idpapi/mcp/guides/xaa.md
[users-source]: https://github.com/worldcoin/temporal-apps/blob/9eedf2dee3a8fb1d864e02c59a98982a2c811e61/apps/idpapi/mcp/guides/world-id-users.md
[coding-source]: https://github.com/worldcoin/temporal-apps/blob/9eedf2dee3a8fb1d864e02c59a98982a2c811e61/apps/idpapi/mcp/guides/coding-agent-setup.md
[testing-source]: https://github.com/worldcoin/temporal-apps/blob/9eedf2dee3a8fb1d864e02c59a98982a2c811e61/apps/idpapi/mcp/guides/testing.md
