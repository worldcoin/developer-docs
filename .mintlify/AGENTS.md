# Documentation maintenance

- Write all published pages, maintenance notes, commit messages, and PR descriptions in English.
- Follow the existing MDX, navigation, branding, and terminology conventions. Register pages in `docs.json`; reuse existing snippets and components when they fit.
- Document durable product behavior, public contracts, and necessary integration setup. Keep implementation walkthroughs, operational runbooks, and PR history out of published pages.
- Keep changes focused. Preserve coverage of the rest of the site when extending maintenance to IDP. Explain any necessary edits outside the affected product area.
- Keep commit subjects and PR titles short. Follow the repository's PR template. If there is no template, use `Summary` with one to three bullets and `Testing` with commands and outcomes or `Not run`.
- Respect the task's validation limits. State which checks passed, failed, or were skipped; never claim an unrun check passed. Do not publish or merge automatically.

## IDP

The new tab has eleven generated pages under `world-id-auth/`, starting with Quickstart. Read [the source and cutover map](world-id-auth-migration.md) and [publishing runbook](world-id-auth-publishing.md) before updating them.

- Keep `worldcoin/temporal-apps/apps/idpapi/mcp/guides/*.md` as the canonical guide text shared by the Auth browser documentation, MCP, and the generated Mintlify pages. Make content changes in those Markdown files, then regenerate. The landing page in `apps/idpportal/docs.html` is excluded from this migration.
- Do not edit generated `world-id-auth/*.mdx` bodies directly. Keep publishing metadata and approved adaptations in `.mintlify/world-id-auth-pages.json` and `scripts/sync-world-id-auth.mjs`. Record the source commit in `.mintlify/world-id-auth-source.json` through the generator.
- Read relevant source diffs and the complete canonical guides. Preserve all sections, tables, examples, limitations, errors, and instructions when converting them to MDX. If code, canonical text, and generated pages disagree, identify the conflict for review and correct the source or converter.
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

Use `.github/workflows/sync-world-id-auth.yml` for one-way publishing from `temporal-apps`. It polls hourly and supports manual dispatch, regenerates the allowlisted pages, and opens or updates a review PR on `codex/sync-world-id-auth`. Keep the source commit visible in that PR. Do not merge automatically or change global `docs.json` during synchronization.

The workflow requires a scoped GitHub App and the configuration in [the publishing runbook](world-id-auth-publishing.md). Merging this workflow to `main` and configuring its credentials are activation steps. Do not describe automatic publishing as active until they are complete and a run succeeds.

Mintlify Autopilot may continue maintaining other product areas. It must not independently rewrite generated IDP pages. Propose IDP content corrections in the canonical Markdown, or change the converter when the publishing adaptation needs correction. This workflow does not deploy Auth or its MCP services.
