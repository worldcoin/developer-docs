# IDP maintenance

Keep IDP guides in `worldcoin/temporal-apps/apps/idpapi/mcp/guides/*.md`. Auth's browser documentation and MCP consume that Markdown; this repository publishes generated MDX from the same source. Publication here does not deploy Auth or update its embedded MCP guides.

## Files and ownership

| File | Purpose |
| --- | --- |
| `world-id-auth-pages.json` | Source allowlist, destination routes, metadata, and approved publishing adaptations. |
| `world-id-auth-source.json` | Canonical commit and hashes used for generated pages. |
| `world-id-auth-compatibility.json` | Existing URL equivalents, legacy aliases, MCP resources, and access boundaries. This is a contract, not deployed routing configuration. |
| `scripts/sync-world-id-auth.mjs` | Deterministic Markdown-to-MDX publisher. |
| Mintlify Autopilot | Source-change monitoring, canonical corrections, and publishing review PRs through the existing Mintlify GitHub integration. |

The JSON files above live in `.mintlify/`; script paths are relative to the repository root. Keep global navigation in `docs.json` separately maintained. The custom hourly GitHub publishing workflow is retired; no custom publishing App or Actions credentials are required by this maintenance flow.

## Content changes

- Change product guidance in the canonical Markdown, then regenerate. Do not edit generated `agent-pass/*.mdx` bodies independently.
- Preserve complete sections, tables, examples, errors, limitations, and agent instructions, including everything after `Agent instructions`. Auth's HTML may omit agent-only sections; its raw Markdown and MCP are the complete sources.
- Use the manifest for renamed routes, old heading aliases, and approved layout adaptations. Keep existing public URLs useful when the source reorganizes or merges topics. Do not restore obsolete product guidance merely to retain an old route.
- Preserve production and sandbox examples separately. Resolve production `{{issuer}}` to `https://auth.world.org`; keep documented sandbox values on `https://sandbox.auth.world.org`.
- The public adaptation of `world-id-users.md` changes its introduction for public readers. It does not remove authorization from Auth's user guide or account tools.
- Review Autopilot's IDP proposals against the canonical source and apply accepted content corrections there before publishing. If Autopilot cannot write `temporal-apps`, it must provide an exact canonical-source patch with supporting references and mark it pending. Do not publish guidance only in generated pages while Auth's guides still disagree. The converter transports reviewed Markdown; independent edits to generated IDP pages will be overwritten. Autopilot can continue maintaining other product areas.

Review relevant changes in `apps/idpapi`, `apps/idpportal`, `apps/idpweb`, `apps/idpworker`, `pkg/postgres/worldidp`, and `infra/lib/idp`, including shared code that changes the public contract. Link the source change in publishing PRs and check whether its behavior is released.

## Generate and publish

In Mintlify, keep Autopilot enabled with `worldcoin/developer-docs` as the documentation repository and `worldcoin/temporal-apps` connected as source context. Configure the existing Agent Pass/code-change maintenance rather than adding a competing automation. Preserve the source-path scope above, concise review PRs, and human review before merge. Check live saved instructions and triggers; repository instructions alone do not establish dashboard configuration.

At the November 12, 2026 handoff, both repositories were connected and the existing Tuesday/Thursday maintenance instructions were updated. Autopilot reported that its sandbox blocks the Node.js converter and that its source checkout cannot fetch newer commits. Automatic generated-page publication therefore remains pending. An authorized maintainer can use the procedure below with current source access; do not describe this fallback as automatic synchronization.

Resolve the selected source revision and the latest commit changing `apps/idpapi/mcp/guides` at that revision, using repository history or the connected GitHub tools. Read the full allowlisted guide files at that commit. In the execution environment, use the connected checkout or materialize those exact files under the canonical directory layout; never execute code from the source repository.

Verify source freshness against the selected upstream revision. A stale cached checkout is not evidence that the guides on `main` are unchanged. If current upstream history or complete source files are unavailable, report the last verified revision and keep publication pending.

From the documentation repository root, with `idp_source_dir` set to that source directory and `idp_guide_commit` set to the resolved full guide-changing SHA:

```sh
node scripts/sync-world-id-auth.mjs \
  --source-dir "$idp_source_dir" \
  --source-commit "$idp_guide_commit"
```

Review generated pages and the source lock together. Add `--check` to compare without writing. Include both in one Mintlify-created review PR, linked to the canonical source revision and relevant source PRs. If there is no generated change, do not open a publishing PR. Use the existing test suite when validation fits the task budget:

```sh
node --test scripts/sync-world-id-auth.test.mjs
```

If the Mintlify environment cannot access the full canonical source, resolve its revision, run Node.js, or include generated output in a PR, stop publication and report the exact missing capability. Provide the pinned source revision and the regeneration command to an authorized maintainer who can run it with their existing repository access. Do not request a custom App as the default workaround, replace complete guides with paraphrased copies, or hand-write source/output hashes.

Generated provenance and the PR's source link use the guide-changing commit so unrelated source commits do not update an open publishing PR. Keep reviews of non-main source revisions separate from normal maintenance; label them as unmerged source and do not imply they have shipped.

Verify the complete Mintlify publication path with an actual run that produces a generated-content PR before calling synchronization operational. Saved instructions and connected repositories establish configuration, not successful execution. Mintlify publishes after the documentation PR merges through the site's existing configuration. A source merge or a local pass does not establish a production release or update Auth's embedded MCP guides.

## URLs and MCP

Agent Pass stays in `docs.json` as a tab with `hidden: true` and `searchable: true` while its published content is tested through World Docs MCP. Keep the complete groups and page list so direct links retain the internal sidebar. Mintlify reveals hidden tabs when active, so scoped rules in `tailwind.css` also hide Agent Pass from desktop and mobile tab switchers. Keep these rules in place and promotional cards hidden until launch. Keep all generated pages and `seo.indexing: "all"`; do not add `noindex` or exclude `agent-pass/` from publication. Pages remain public at their existing URLs and can appear in search. Keep the homepage's agent-only link and technical MCP references for discovery. See [Mintlify hidden pages](https://www.mintlify.com/docs/organize/hidden-pages).

The public documentation routes use `/agent-pass/`. Redirects in `docs.json` preserve the former `/world-id-auth/` HTML and raw Markdown page URLs and send both documentation roots to `/agent-pass/quickstart`. Keep the internal `world-id-auth` configuration and script filenames unchanged.

Continue dual publication. Use the compatibility contract for the actual route/resource map, including the legacy `mcp-oauth` alias and trailing-slash variants. Keep Auth's existing routes on their production or sandbox hosts:

- `/docs` and `/docs/`, whose landing content has no migrated equivalent.
- Existing guide HTML, full `/docs/guides/coding-agent-setup.md`, `/llms.txt`, and `/robots.txt`.
- User `/mcp`, developer `/mcp/developer`, their `worldid://guides/` resources, and `/.well-known/*` discovery.

Rewrite documentation links only. Issuer, discovery, OAuth, portal, consent, connection-management, and MCP URLs remain on the matching Auth host. Preserve IDs, claims, scopes, tool names, payloads, and existing heading fragments unless a reviewed source change explicitly changes that contract.

World Docs MCP at `https://docs.world.org/mcp` searches published documentation. Auth's developer MCP exposes public guides and separately authorized portal tools. Auth's user MCP retains its protected account access. Their identities, tokens, and permissions are not interchangeable.

No Auth routing change is needed for dual publication. Any later redirect requires a separate Auth change limited to approved production HTML routes. Keep the landing page, raw Markdown, indexes, sandbox documentation, MCP, and discovery routes served. Never use a blanket `/docs*` redirect or send sandbox agent instructions to production examples.

## Release evidence and recovery

- Repository owner: canonical corrections reviewed and merged; publishing PR contains reproducible pages and source lock.
- Mintlify owner: saved Autopilot scope, a successful generated-content PR, and manifest routes published, indexed, and readable through World Docs MCP, with complete agent instructions in Markdown.
- Auth owner: deployed guide content matches the intended source and environment; existing URLs, MCP resources, and access controls remain available.

After publication, use a small search/read check through available MCP connections and existing URL checks, within two minutes total and without browser QA or a new harness. Record passes, failures, and skipped checks. Missing deployment evidence remains explicit follow-up work.

For the hidden-page test, search World Docs MCP for the coding-agent guide and read `/agent-pass/build-with-a-coding-agent.mdx` through its docs filesystem tool. Verify the complete `Agent instructions` section and the Auth MCP URLs. To test updates from `temporal-apps`, publish a reviewed source change through the configured docs automation, merge its documentation PR, then read the changed section through World Docs MCP after Mintlify publishes it. A successful source sync and a refreshed MCP response are separate checks; a preview does not prove production indexing.

Investigate failed publishing runs, persistent empty searches, and guide-content mismatches. Compare content or source hashes, since different commits can contain identical guides. Revert and republish a bad documentation update; roll back a failing Auth release in its owning deployment. Keep existing Auth publication available throughout recovery.
