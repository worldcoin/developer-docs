# Documentation maintenance

- Write all published pages, maintenance notes, commit messages, and PR descriptions in English.
- Follow the existing MDX, navigation, branding, and terminology conventions. Register pages in `docs.json`; reuse existing snippets and components when they fit.
- Document durable product behavior, public contracts, and necessary integration setup. Keep implementation walkthroughs, operational runbooks, and PR history out of published pages.
- Keep changes focused. Preserve coverage of the rest of the site when extending maintenance to IDP. Explain any necessary edits outside the affected product area.
- Keep commit subjects and PR titles short. Follow the repository's PR template. If there is no template, use `Summary` with one to three bullets and `Testing` with commands and outcomes or `Not run`.
- Respect the task's validation limits. State which checks passed, failed, or were skipped; never claim an unrun check passed. Do not publish or merge automatically.

## IDP

Keep Agent Pass in `docs.json` as a tab with `hidden: true` and `searchable: true` during MCP testing. Preserve its complete groups and page list so direct links retain the internal sidebar without exposing the top-level tab. Keep the generated `world-id-auth/` pages, their URLs, agent-only homepage link, and `seo.indexing: "all"` so they remain available to search and AI tools. Do not make the tab or promotional cards visible until the public launch is requested. Read [IDP maintenance](world-id-auth-maintenance.md) before changing generated pages. Use the manifest, source lock, and compatibility contract for current coverage and provenance.

- Keep `worldcoin/temporal-apps/apps/idpapi/mcp/guides/*.md` as the canonical guide text shared by the Auth browser documentation, MCP, and the generated Mintlify pages. Make content changes in those Markdown files, then regenerate. The landing page in `apps/idpportal/docs.html` is excluded from this migration.
- Do not edit generated `world-id-auth/*.mdx` bodies directly. Keep publishing metadata and approved adaptations in `.mintlify/world-id-auth-pages.json` and `scripts/sync-world-id-auth.mjs`. Record the source commit in `.mintlify/world-id-auth-source.json` through the generator.
- Read relevant source diffs and the complete canonical guides. Preserve all sections, tables, examples, limitations, errors, and instructions when converting them to MDX. If code, canonical text, and generated pages disagree, identify the conflict for review and correct the source or converter.
- Keep the complete `coding-agent-setup.md` content, including `Agent instructions` and all sections after it. The Auth HTML renderer hides those sections; copying only rendered HTML loses content.
- Public adaptation of `world-id-users.md` as `use-world-id-with-your-agent.mdx` is approved for this migration. Adapt its authenticated-reader introduction for public readers. Keep the original MCP guide's access controls and the authentication requirements of account tools unchanged.
- Rewrite documentation links to the new routes. Keep issuer, discovery, authorization, token, portal, MCP, consent, connection-management, and resource-metadata URLs on the correct Auth host. Moving documentation does not move an API endpoint.
- Keep production, sandbox, staging, and local behavior separate. A source merge does not prove a production release. Use matching issuer, discovery, registration, and credentials for each environment; flag unclear release status.
- Preserve IDs, claims, scopes, method names, errors, example payloads, and existing section anchors. Flag legacy URLs that need redirects. Do not imply that Auth redirects or a documentation cutover have been deployed.
- Preserve dual publication using [the compatibility contract](world-id-auth-compatibility.json). Keep Auth's landing page, full raw agent Markdown, `llms.txt`, `mcp-oauth` alias, MCP endpoints, and discovery routes available on their existing environment hosts. The contract is not deployed routing configuration; do not replace these paths with blanket redirects.
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

Use `.github/workflows/sync-world-id-auth.yml` for one-way publishing from `temporal-apps`. It polls hourly and supports manual dispatch, regenerating the allowlisted pages. Scheduled and manual `main` publications use `codex/sync-world-id-auth`; manual non-main sources use `codex/sync-world-id-auth-manual-<resolved-source-SHA>` to keep their reviews separate. `refs/heads/main` also uses the main publishing branch. Keep the source commit visible in the PR. Do not merge automatically or change global `docs.json` during synchronization.

Use the latest commit changing `apps/idpapi/mcp/guides` at the selected checkout for generated provenance and the PR's source link. Unrelated source commits must not churn open publishing PRs. Keep manual branch isolation based on the selected checkout's HEAD, and stop publishing if guide provenance cannot be resolved.

The workflow requires a scoped GitHub App and the configuration in [IDP maintenance](world-id-auth-maintenance.md). Merging this workflow to `main` and configuring its credentials are activation steps. Do not describe automatic publishing as active until they are complete and a run succeeds.

Mintlify Autopilot may propose IDP content corrections in the canonical Markdown and continue maintaining other product areas. Publishing transports that reviewed source. Do not independently rewrite generated IDP pages, since regeneration overwrites those edits. Change the converter when a publishing adaptation needs correction. This workflow does not deploy Auth or its MCP services.
