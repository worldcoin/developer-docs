# Documentation maintenance

- Write all published pages, maintenance notes, commit messages, and PR descriptions in English.
- Follow the existing MDX, navigation, branding, and terminology conventions. Register pages in `docs.json`; reuse existing snippets and components when they fit.
- Document durable product behavior, public contracts, and necessary integration setup. Keep implementation walkthroughs, operational runbooks, and PR history out of published pages.
- Keep changes focused. Preserve coverage of the rest of the site when extending maintenance to World ID Auth. Explain any necessary edits outside the affected product area.
- Keep commit subjects and PR titles short. Follow the repository's PR template. If there is no template, use `Summary` with one to three bullets and `Testing` with commands and outcomes or `Not run`.
- Respect the task's validation limits. State which checks passed, failed, or were skipped; never claim an unrun check passed. Do not publish or merge automatically.

## World ID Auth

The new tab has twelve pages under `world-id-auth/`. Read [the source and cutover map](world-id-auth-migration.md) before updating them.

- Treat `worldcoin/temporal-apps` as the implementation source. Until its publishing contract changes, `apps/idpapi/mcp/guides/*.md` remain the canonical guide text shared by the Auth browser documentation and MCP. The overview comes from `apps/idpportal/docs.html`.
- Read relevant source diffs and the complete canonical guides. Preserve all sections, tables, examples, limitations, errors, and instructions when adapting them to MDX. If code, canonical text, and migrated pages disagree, identify the conflict for review rather than silently choosing a new contract.
- Keep the complete `coding-agent-setup.md` content, including `Agent instructions` and all sections after it. The Auth HTML renderer hides those sections; copying only rendered HTML loses content.
- Public adaptation of `world-id-users.md` as `use-world-id-with-your-agent.mdx` is approved for this migration. Adapt its authenticated-reader introduction for public readers. Keep the original MCP guide's access controls and the authentication requirements of account tools unchanged.
- Rewrite documentation links to the new routes. Keep issuer, discovery, authorization, token, portal, MCP, consent, connection-management, and resource-metadata URLs on the correct Auth host. Moving documentation does not move an API endpoint.
- Keep production, sandbox, staging, and local behavior separate. A source merge does not prove a production release. Use matching issuer, discovery, registration, and credentials for each environment; flag unclear release status.
- Preserve IDs, claims, scopes, method names, errors, example payloads, and existing section anchors. Flag legacy URLs that need redirects. Do not imply that Auth redirects or a documentation cutover have been deployed.
- Keep IDKit verification, Auth OIDC, the Auth user MCP, the Auth developer MCP, and the other documented World MCP services distinct. Their registrations, identities, tokens, and authorization contracts are not interchangeable.
- Never copy secrets, account data, internal runbooks, private operational URLs, or deployment configuration into public documentation. Source repository access does not make every source file suitable for publication.

Review IDP changes in these source paths, plus shared-code changes that affect the public contract:

```text
apps/idpapi/**
apps/idpportal/**
apps/idpweb/**
apps/idpworker/**
pkg/postgres/worldidp/**
infra/lib/idp/**
```

Include the source PR and relevant source files in documentation PRs. Leave pages unchanged when a source change has no developer-facing effect.

## Maintenance configuration

Use the existing Mintlify Autopilot setup when the owner grants its GitHub App access to `worldcoin/temporal-apps` and connects that repository as additional context. This repository preparation does not activate that connection or prove that Auth changes are being monitored.

Do not add a second custom synchronization workflow for this migration. Propose changes through the existing review process, preserve the current coverage of other products, and confirm the source connection separately before describing automatic Auth maintenance as active.
