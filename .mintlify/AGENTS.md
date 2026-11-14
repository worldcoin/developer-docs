# Documentation maintenance

- Write all published pages, maintenance notes, commit messages, and PR descriptions in English.
- Follow the existing MDX, navigation, branding, and terminology conventions. Register pages in `docs.json`; reuse existing snippets and components when they fit.
- Document durable product behavior, public contracts, and necessary integration setup. Keep implementation walkthroughs, operational runbooks, and PR history out of published pages.
- Keep changes focused. Preserve coverage of the rest of the site when extending maintenance to IDP. Explain any necessary edits outside the affected product area.
- Keep commit subjects and PR titles short. Follow the repository's PR template. If there is no template, use `Summary` with one to three bullets and `Testing` with commands and outcomes or `Not run`.
- Respect the task's validation limits. State which checks passed, failed, or were skipped; never claim an unrun check passed. Do not publish or merge automatically.

## IDP

Keep Agent Pass in `docs.json` as a tab with `hidden: true` and `searchable: true` during MCP testing. Preserve its complete groups and page list so direct links retain the internal sidebar. Keep the scoped Agent Pass tab rules in `tailwind.css`: Mintlify otherwise reveals the hidden tab when it is active. Keep the `agent-pass/` pages, their URLs, agent-only homepage link, and `seo.indexing: "all"` so they remain available to search and AI tools. Do not make the tab or promotional cards visible until the public launch is requested. Read [IDP maintenance](world-id-auth-maintenance.md) before changing pages. The manifest maps the original guides to documentation routes; the compatibility contract records Auth boundaries.

- `worldcoin/temporal-apps` implementation and merged PRs provide evidence for product behavior. Its `apps/idpapi/mcp/guides/*.md` files remain the canonical guides consumed by Auth's browser documentation and MCP. Read both when maintaining the corresponding Mintlify pages. The landing page in `apps/idpportal/docs.html` is excluded from this migration.
- Mintlify Autopilot may directly create and edit `agent-pass/*.mdx` and open review PRs. Running `scripts/sync-world-id-auth.mjs`, Node.js, or merging an Auth-guide correction first is not a prerequisite for a documentation PR. Preserve approved publishing adaptations and use the manifest for existing source-to-page mappings.
- Read relevant source diffs and complete affected guides. Preserve all human-facing sections, tables, examples, limitations, errors, and setup instructions. Classify the audience before adding content from a merged PR. When code and Auth's guides disagree, explain the discrepancy and include the exact corresponding Auth-guide patch and source path in the documentation PR if source writes are unavailable. Mark that follow-up pending instead of silently claiming both publications agree.
- Match `temporal-apps/apps/idpportal/vite.config.ts` function `humanGuideMarkdown`: the human `coding-agent-setup` page ends immediately before the single `## Agent instructions` heading. Exclude that heading and every later section from Mintlify, including portal tool workflows and agent feedback instructions. Keep the human setup prefix. Agent prompts and instruction links must target the full `/docs/guides/coding-agent-setup.md` on the matching Auth host; Mintlify's Markdown export contains only the human page.
- Read and preserve the full canonical agent guide for context, but keep its agent-only tail on Auth's raw Markdown and MCP surfaces. Do not delete it from `temporal-apps` or copy it into other public pages, collapsed blocks, metadata, examples, or snippets. A merged agent-tool change alone does not require human docs. Follow the source repository's durable-product/public-contract rule; skip implementation walkthroughs, PR history, fix internals, and agent orchestration instructions.
- Public adaptation of `world-id-users.md` as `use-world-id-with-your-agent.mdx` is approved for this migration. Adapt its authenticated-reader introduction for public readers. Keep the original MCP guide's access controls and the authentication requirements of account tools unchanged.
- Rewrite documentation links to the new routes. Keep issuer, discovery, authorization, token, portal, MCP, consent, connection-management, and resource-metadata URLs on the correct Auth host. Moving documentation does not move an API endpoint.
- Maintain pages under `agent-pass/`. Preserve the former `/world-id-auth/` documentation URLs through the redirects in `docs.json`; keep internal `world-id-auth` configuration and script filenames unchanged.
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

On each run, inspect new merged `temporal-apps` PRs since the last successfully reviewed boundary. Read actual diffs and relevant implementation context, not just PR titles. Update affected MDX directly and open a concise review PR citing the source PRs, commits, files, and developer-facing effects. Skip changes without a documentation impact, group related changes, and check existing open documentation PRs to avoid duplication. Do not merge automatically. Register new pages within the existing hidden Agent Pass navigation only when needed.

Keep Auth-guide follow-ups explicit. Missing source-write permission or a pending canonical-guide patch does not block proposing a supported `developer-docs` update. Include the exact Markdown patch in the PR description when the Auth guide needs the same correction. Auth deployment and its embedded MCP refresh are separate work; never describe them as completed by merging a Mintlify PR.

Verify freshness with current repository tools and merged-PR history. Do not treat a stale cached checkout as current `main`. If one relevant change cannot be read, identify that gap and leave it unreviewed while proceeding with unrelated changes that have adequate evidence. Do not advance the review boundary over unreviewed changes.

The converter is an optional reconciliation tool, not the publishing owner or an automation gate. It can overwrite native edits, so review its output separately before applying it. `.mintlify/world-id-auth-source.json` records the last converter snapshot only; it is not provenance for subsequent native edits. Leave its hashes unchanged during native maintenance and cite current evidence in the PR instead. Never fabricate hashes or discard human-facing setup instructions. Optional imports must enforce the same audience boundary as native edits.

Treat saved Autopilot instructions, an actual documentation PR, a Mintlify deployment, and a refreshed World Docs MCP response as separate evidence. Do not describe a configured job as a completed run. Publishing here does not deploy Auth or update its embedded MCP guides; track pending guide corrections and Auth release evidence separately.
