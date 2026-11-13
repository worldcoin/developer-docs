# IDP maintenance

Mintlify Autopilot reads `worldcoin/temporal-apps`, reviews merged product PRs, and directly updates `agent-pass/*.mdx` through documentation review PRs. Auth's browser documentation and MCP continue consuming `temporal-apps/apps/idpapi/mcp/guides/*.md`. Keep corresponding guide corrections explicit; publishing here does not deploy Auth or update its embedded MCP guides.

## Files and ownership

| File | Purpose |
| --- | --- |
| `world-id-auth-pages.json` | Original guide-to-page mappings, metadata, and approved publishing adaptations. |
| `world-id-auth-source.json` | Last converter snapshot only; not provenance for later native Mintlify edits. |
| `world-id-auth-compatibility.json` | Existing URL equivalents, legacy aliases, MCP resources, and access boundaries. This is a contract, not deployed routing configuration. |
| `scripts/sync-world-id-auth.mjs` | Optional deterministic import/reconciliation tool; not required for Autopilot maintenance. |
| Mintlify Autopilot | Source-change monitoring, canonical corrections, and publishing review PRs through the existing Mintlify GitHub integration. |

The JSON files above live in `.mintlify/`; script paths are relative to the repository root. Keep global navigation in `docs.json` separately maintained. The custom hourly GitHub publishing workflow is retired; no custom publishing App or Actions credentials are required by this maintenance flow.

## Content changes

- Create and edit the affected `agent-pass/*.mdx` pages directly using merged source PRs, implementation context, and the complete Auth guides. Native maintenance does not require Node.js, the converter, or a source-guide merge first.
- Preserve complete sections, tables, examples, errors, limitations, and agent instructions, including everything after `Agent instructions`. Auth's HTML may omit agent-only sections; its raw Markdown and MCP are the complete sources.
- Use the manifest for renamed routes, old heading aliases, and approved layout adaptations. Keep existing public URLs useful when the source reorganizes or merges topics. Do not restore obsolete product guidance merely to retain an old route.
- Preserve production and sandbox examples separately. Resolve production `{{issuer}}` to `https://auth.world.org`; keep documented sandbox values on `https://sandbox.auth.world.org`.
- The public adaptation of `world-id-users.md` changes its introduction for public readers. It does not remove authorization from Auth's user guide or account tools.
- Compare code-backed corrections with the corresponding Auth guides. If a guide also needs updating and source writes are unavailable, include its exact Markdown patch and source path in the documentation PR description, marked pending Auth-guide update. Do not silently claim both publications agree. That follow-up does not block proposing a supported documentation PR. Autopilot can continue maintaining other product areas.

Review relevant changes in `apps/idpapi`, `apps/idpportal`, `apps/idpweb`, `apps/idpworker`, `pkg/postgres/worldidp`, and `infra/lib/idp`, including shared code that changes the public contract. Link the source change in publishing PRs and check whether its behavior is released.

## Native maintenance and publication

Keep Autopilot enabled with `worldcoin/developer-docs` as the documentation repository and `worldcoin/temporal-apps` connected as source context. Use the existing Agent Pass code-change maintenance job and its current schedule; avoid overlapping jobs and leave unrelated product maintenance unchanged. Save the direct-edit policy in the live job and standing instructions. Repository instructions alone do not establish dashboard configuration.

On each run:

1. Inspect new merged `temporal-apps` PRs since the last successfully reviewed boundary. Read the actual source diffs and relevant implementation for the paths above, not only PR titles. Skip changes without public documentation impact.
2. Compare supported changes with the affected MDX and complete Auth guides. Edit the documentation directly, preserving all existing instructions and the environment/MCP boundaries below. Do not require the converter, hash regeneration, or an earlier canonical-guide merge.
3. Group related changes into concise review PRs with links to source PRs, commits, and files. Avoid duplicating open documentation PRs. Include exact pending Auth-guide patches when needed and distinguish merged code from verified deployed behavior.
4. Keep the review boundary explicit. A stale cached checkout alone is not evidence of current `main`; use current repository tools or merged-PR history for newer changes. If evidence for one change is inaccessible, flag that gap without blocking unrelated well-supported updates. Never advance past unreviewed changes.

Mintlify publishes after a documentation PR merges through the site's existing configuration. The normal automated deliverable is a proposed documentation PR, not an automatic merge or an Auth deployment. Verify configuration and an actual maintenance result separately.

## Optional converter reconciliation

The converter remains available for deliberate imports from a reviewed guide revision. It is not part of the native Autopilot publication path. Node execution being unavailable in Mintlify does not block native documentation updates.

`.mintlify/world-id-auth-source.json` records the last converter snapshot, including its source revision and hashes. Native edits may differ from that snapshot. Do not update its hashes by hand or treat them as provenance for later edits; cite the actual source evidence in the maintenance PR.

A converter run can overwrite native improvements that have not reached Auth's guides. Generate into a separate review directory first. With `idp_source_dir` pointing to complete guide files at the reviewed revision, `idp_guide_commit` set to the full guide-changing SHA, and `idp_review_dir` pointing to a separate output directory:

```sh
node scripts/sync-world-id-auth.mjs \
  --source-dir "$idp_source_dir" \
  --source-commit "$idp_guide_commit" \
  --output-dir "$idp_review_dir"
```

Compare that output with the maintained pages and resolve differences in a review PR. Preserve native improvements or propose matching Auth-guide corrections rather than blindly replacing them. Apply a converter import and its generated snapshot together only after that review. A converter `--check` difference can reflect intentional native maintenance; it is not an automatic instruction to revert the pages.

Existing converter tests remain useful when that tool changes and validation fits the task budget:

```sh
node --test scripts/sync-world-id-auth.test.mjs
```

## URLs and MCP

Agent Pass stays in `docs.json` as a tab with `hidden: true` and `searchable: true` while its published content is tested through World Docs MCP. Keep the complete groups and page list so direct links retain the internal sidebar. Mintlify reveals hidden tabs when active, so scoped rules in `tailwind.css` also hide Agent Pass from desktop and mobile tab switchers. Keep these rules in place and promotional cards hidden until launch. Keep all pages and `seo.indexing: "all"`; do not add `noindex` or exclude `agent-pass/` from publication. Pages remain public at their existing URLs and can appear in search. Keep the homepage's agent-only link and technical MCP references for discovery. See [Mintlify hidden pages](https://www.mintlify.com/docs/organize/hidden-pages).

The public documentation routes use `/agent-pass/`. Redirects in `docs.json` preserve the former `/world-id-auth/` HTML and raw Markdown page URLs and send both documentation roots to `/agent-pass/quickstart`. Keep the internal `world-id-auth` configuration and script filenames unchanged.

Continue dual publication. Use the compatibility contract for the actual route/resource map, including the legacy `mcp-oauth` alias and trailing-slash variants. Keep Auth's existing routes on their production or sandbox hosts:

- `/docs` and `/docs/`, whose landing content has no migrated equivalent.
- Existing guide HTML, full `/docs/guides/coding-agent-setup.md`, `/llms.txt`, and `/robots.txt`.
- User `/mcp`, developer `/mcp/developer`, their `worldid://guides/` resources, and `/.well-known/*` discovery.

Rewrite documentation links only. Issuer, discovery, OAuth, portal, consent, connection-management, and MCP URLs remain on the matching Auth host. Preserve IDs, claims, scopes, tool names, payloads, and existing heading fragments unless a reviewed source change explicitly changes that contract.

World Docs MCP at `https://docs.world.org/mcp` searches published documentation. Auth's developer MCP exposes public guides and separately authorized portal tools. Auth's user MCP retains its protected account access. Their identities, tokens, and permissions are not interchangeable.

No Auth routing change is needed for dual publication. Any later redirect requires a separate Auth change limited to approved production HTML routes. Keep the landing page, raw Markdown, indexes, sandbox documentation, MCP, and discovery routes served. Never use a blanket `/docs*` redirect or send sandbox agent instructions to production examples.

## Release evidence and recovery

- Repository owner: review the documentation PR and its code references; track any pending Auth-guide correction explicitly.
- Mintlify owner: saved Autopilot scope, an actual native documentation PR, and routes published, indexed, and readable through World Docs MCP, with complete agent instructions in Markdown.
- Auth owner: deployed guide content matches the intended source and environment; existing URLs, MCP resources, and access controls remain available.

After publication, use a small search/read check through available MCP connections and existing URL checks, within two minutes total and without browser QA or a new harness. Record passes, failures, and skipped checks. Missing deployment evidence remains explicit follow-up work.

For the hidden-page test, search World Docs MCP for the coding-agent guide and read `/agent-pass/build-with-a-coding-agent.mdx` through its docs filesystem tool. Verify the complete `Agent instructions` section and the Auth MCP URLs. To test updates from `temporal-apps`, publish a reviewed source change through the configured docs automation, merge its documentation PR, then read the changed section through World Docs MCP after Mintlify publishes it. A merged documentation PR and a refreshed MCP response are separate checks; a preview does not prove production indexing.

Investigate failed publishing runs, persistent empty searches, and guide-content mismatches. Compare the current pages, supporting source PRs, complete Auth guides, and any pending guide patches. The last converter hashes alone do not describe native edits. Revert and republish a bad documentation update; roll back a failing Auth release in its owning deployment. Keep existing Auth publication available throughout recovery.
