# Documentation maintenance

- Write all published pages, maintenance notes, commit messages, and PR descriptions in English.
- Follow the existing MDX, navigation, branding, and terminology conventions. Register pages in `docs.json`; reuse existing snippets and components when they fit.
- Document durable product behavior, public contracts, and necessary integration setup. Keep implementation walkthroughs, operational runbooks, and PR history out of published pages.
- Keep changes focused. Preserve coverage of the rest of the site when extending maintenance to IDP. Explain any necessary edits outside the affected product area.
- Keep commit subjects and PR titles short. Follow the repository's PR template. If there is no template, use `Summary` with one to three bullets and `Testing` with commands and outcomes or `Not run`.
- Respect the task's validation limits. State which checks passed, failed, or were skipped; never claim an unrun check passed. Do not publish or merge automatically.

## IDP

Keep Agent Pass in `docs.json` as a tab with `hidden: true` and `searchable: true` during MCP testing. Preserve its complete groups and page list so direct links retain the internal sidebar. Keep the scoped Agent Pass tab rules in `tailwind.css`: Mintlify otherwise reveals the hidden tab when it is active. Keep the generated `agent-pass/` pages, their URLs, agent-only homepage link, and `seo.indexing: "all"` so they remain available to search and AI tools. Do not make the tab or promotional cards visible until the public launch is requested. Read [IDP maintenance](world-id-auth-maintenance.md) before changing generated pages. Use the manifest, source lock, and compatibility contract for current coverage and provenance.

- Keep `worldcoin/temporal-apps/apps/idpapi/mcp/guides/*.md` as the canonical guide text shared by the Auth browser documentation, MCP, and the generated Mintlify pages. Make content changes in those Markdown files, then regenerate. The landing page in `apps/idpportal/docs.html` is excluded from this migration.
- Do not edit generated `agent-pass/*.mdx` bodies directly. Keep publishing metadata and approved adaptations in `.mintlify/world-id-auth-pages.json` and `scripts/sync-world-id-auth.mjs`. Record the source commit in `.mintlify/world-id-auth-source.json` through the generator.
- Read relevant source diffs and the complete canonical guides. Preserve all sections, tables, examples, limitations, errors, and instructions when converting them to MDX. If code, canonical text, and generated pages disagree, identify the conflict for review and correct the source or converter.
- Keep the complete `coding-agent-setup.md` content, including `Agent instructions` and all sections after it. The Auth HTML renderer hides those sections; copying only rendered HTML loses content.
- Public adaptation of `world-id-users.md` as `use-world-id-with-your-agent.mdx` is approved for this migration. Adapt its authenticated-reader introduction for public readers. Keep the original MCP guide's access controls and the authentication requirements of account tools unchanged.
- Rewrite documentation links to the new routes. Keep issuer, discovery, authorization, token, portal, MCP, consent, connection-management, and resource-metadata URLs on the correct Auth host. Moving documentation does not move an API endpoint.
- Publish the generated guides under `agent-pass/`. Preserve the former `/world-id-auth/` documentation URLs through the redirects in `docs.json`; keep internal `world-id-auth` configuration and script filenames unchanged.
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

Mintlify Autopilot owns Agent Pass maintenance and publishing review PRs using its existing GitHub integration with `developer-docs` and `temporal-apps`. Do not restore the retired hourly GitHub publishing workflow or require `IDP_DOCS_APP_ID` or `IDP_DOCS_APP_PRIVATE_KEY`. Leave unrelated product maintenance enabled and avoid overlapping Agent Pass automations.

For product changes, compare the implementation with the complete canonical Markdown. Propose corrections in `temporal-apps` first. If source writes are unavailable, provide an exact canonical-source patch with source references and mark it pending; do not publish conflicting guidance only in `developer-docs`. After source corrections merge, use `scripts/sync-world-id-auth.mjs` to regenerate the allowlisted pages and source lock together in a review PR. Keep the source commit visible and do not merge automatically or change global `docs.json` during synchronization.

Use the latest commit changing `apps/idpapi/mcp/guides` at the selected source revision for provenance and the PR's source link. Obtain complete source files at that revision, using the connected repository checkout or existing authorized repository tools. Unrelated source commits must not churn open publishing PRs. Stop publishing if guide provenance cannot be resolved.

Verify the selected revision against current upstream history; do not treat a stale cached checkout as current `main`. If upstream freshness or full source files cannot be verified, report the last verified revision and keep publication pending.

Run the existing converter in Mintlify's execution environment when the canonical source files and Node.js are available. If generation cannot run, report the concrete limitation and provide the source revision and regeneration command for an authorized maintainer; keep publication pending. Do not substitute agent-written summaries, hand-edit generated bodies, or fabricate source/output hashes. Change the converter when a publishing adaptation needs correction. See [IDP maintenance](world-id-auth-maintenance.md) for the procedure.

Treat saved Autopilot instructions, a successful generated-content PR, a Mintlify deployment, and a refreshed World Docs MCP response as separate evidence. Do not describe automatic synchronization as working until a Mintlify run has produced a reproducible publishing PR. Publishing here does not deploy Auth or update its embedded MCP guides; track Auth release evidence separately.
