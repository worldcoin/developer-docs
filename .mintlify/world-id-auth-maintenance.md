# IDP maintenance

Keep IDP guides in `worldcoin/temporal-apps/apps/idpapi/mcp/guides/*.md`. Auth's browser documentation and MCP consume that Markdown; this repository publishes generated MDX from the same source. Publication here does not deploy Auth or update its embedded MCP guides.

## Files and ownership

| File | Purpose |
| --- | --- |
| `world-id-auth-pages.json` | Source allowlist, destination routes, metadata, and approved publishing adaptations. |
| `world-id-auth-source.json` | Canonical commit and hashes used for generated pages. |
| `world-id-auth-compatibility.json` | Existing URL equivalents, legacy aliases, MCP resources, and access boundaries. This is a contract, not deployed routing configuration. |
| `scripts/sync-world-id-auth.mjs` | Deterministic Markdown-to-MDX publisher. |
| `.github/workflows/sync-world-id-auth.yml` | Hourly or manually dispatched publishing PR. |

The JSON files above live in `.mintlify/`; script and workflow paths are relative to the repository root. Keep global navigation in `docs.json` separately maintained.

## Content changes

- Change product guidance in the canonical Markdown, then regenerate. Do not edit generated `agent-pass/*.mdx` bodies independently.
- Preserve complete sections, tables, examples, errors, limitations, and agent instructions, including everything after `Agent instructions`. Auth's HTML may omit agent-only sections; its raw Markdown and MCP are the complete sources.
- Use the manifest for renamed routes, old heading aliases, and approved layout adaptations. Keep existing public URLs useful when the source reorganizes or merges topics. Do not restore obsolete product guidance merely to retain an old route.
- The Quickstart's `quickstartLayout` adaptation renders linked icon cards, environment URLs as JSON, and IDKit guidance matching the World ID overview. The registration guide's `clientAuthenticationExamples` adaptation renders credential and JWT examples. Both retain the canonical text in the agent export and require review when their source structure changes. Keep these adaptations in the publisher and regenerate; do not edit the generated twins.
- The backend guide's `oidcExamples` adaptation uses native code groups for decoded request fields and tabs for polling responses and troubleshooting. JSON blocks show decoded values, not the form-encoded wire body. Preserve the endpoint, encoding instructions, and every response-handling rule alongside these examples; the agent export retains the canonical requests and tables.
- The identity guide's `credentialCards` adaptation uses the existing Proof of Human and Proof of Presence artwork with a passkey tile. Keep credential guarantees and baseline `acr` values from the canonical table. Passkeys authenticate account control and add no biometric uniqueness or Face Auth; preserve the original table in the agent export.
- Preserve production and sandbox examples separately. Resolve production `{{issuer}}` to `https://auth.world.org`; keep documented sandbox values on `https://sandbox.auth.world.org`.
- The public adaptation of `world-id-users.md` changes its introduction for public readers. It does not remove authorization from Auth's user guide or account tools.
- Review Autopilot's IDP proposals against the canonical source and apply accepted content corrections there before publishing. The publisher transports that reviewed Markdown; independent edits to generated IDP pages will be overwritten. Autopilot can continue maintaining other product areas.

Review relevant changes in `apps/idpapi`, `apps/idpportal`, `apps/idpweb`, `apps/idpworker`, `pkg/postgres/worldidp`, and `infra/lib/idp`, including shared code that changes the public contract. Link the source change in publishing PRs and check whether its behavior is released.

## Generate and publish

From the repository root, with the intended `temporal-apps` checkout beside it:

```sh
idp_source_commit=$(git -C ../temporal-apps rev-parse HEAD)
node scripts/sync-world-id-auth.mjs \
  --source-dir ../temporal-apps \
  --source-commit "$idp_source_commit"
```

Review generated pages and the source lock together. Add `--check` to compare without writing. Use the existing test suite when validation fits the task budget:

```sh
node --test scripts/sync-world-id-auth.test.mjs
```

Scheduled runs and manual runs using `main` or `refs/heads/main` open or update a review PR on `codex/sync-world-id-auth`. A manual run using another `source_ref` uses `codex/sync-world-id-auth-manual-<resolved-source-SHA>`, so scheduled updates cannot overwrite that review. Runs resolving to the same source commit reuse that manual branch. The workflow never merges automatically.

The workflow resolves the selected source checkout, then queries its commit history for the latest change under `apps/idpapi/mcp/guides`. Generated provenance and the PR's source link use that guide-changing commit, so unrelated source commits do not update an open publishing PR. Manual branch names still use the selected checkout's HEAD. If the guide commit cannot be resolved to a full SHA, publishing stops without falling back to HEAD.

Configure a scoped GitHub App with source contents read access and destination contents/pull-request write access. In `developer-docs`, set Actions variable `IDP_DOCS_APP_ID` and secret `IDP_DOCS_APP_PRIVATE_KEY`.

Automatic synchronization is active only after the workflow is merged to `main`, the App and credentials are configured, and a run succeeds. Mintlify publishes after the documentation PR merges through the site's existing configuration. A source merge or a local pass does not establish a production release.

## URLs and MCP

Agent Pass stays in `docs.json` as a tab with `hidden: true` and `searchable: true` while its published content is tested through World Docs MCP. Keep the complete groups and page list so direct links retain the internal sidebar. Mintlify reveals hidden tabs when active, so scoped rules in `tailwind.css` also hide Agent Pass from desktop and mobile tab switchers. Keep these rules in place and promotional cards hidden until launch. Keep all generated pages and `seo.indexing: "all"`; do not add `noindex` or exclude `agent-pass/` from publication. Pages remain public at their existing URLs and can appear in search. Keep the homepage's agent-only link and technical MCP references for discovery. See [Mintlify hidden pages](https://www.mintlify.com/docs/organize/hidden-pages).

World ID Overview now compares IDKit and World IdP and links to the approved `world-id/agent-pass.mdx` entry. The Home authentication capability leads to this comparison. These visible discovery entries do not make the standalone Agent Pass tab visible or alter the generated guides.

The public documentation routes use `/agent-pass/`. Redirects in `docs.json` preserve the former `/world-id-auth/` HTML and raw Markdown page URLs and send both documentation roots to `/agent-pass/quickstart`. Keep the internal `world-id-auth` configuration and script filenames unchanged.

Continue dual publication. Use the compatibility contract for the actual route/resource map, including the legacy `mcp-oauth` alias and trailing-slash variants. Keep Auth's existing routes on their production or sandbox hosts:

- `/docs` and `/docs/`, whose landing content has no migrated equivalent.
- Existing guide HTML, full `/docs/guides/coding-agent-setup.md`, `/llms.txt`, and `/robots.txt`.
- User `/mcp`, developer `/mcp/developer`, their `worldid://guides/` resources, and `/.well-known/*` discovery.

Rewrite documentation links only. Issuer, discovery, OAuth, portal, consent, connection-management, and MCP URLs remain on the matching Auth host. Preserve IDs, claims, scopes, tool names, payloads, and existing heading fragments unless a reviewed source change explicitly changes that contract.

World Docs MCP at `https://docs.world.org/mcp` searches published documentation. Auth's developer MCP exposes public guides and separately authorized portal tools. Auth's user MCP retains its protected account access. Their identities, tokens, and permissions are not interchangeable.

No Auth routing change is needed for dual publication. Any later redirect requires a separate Auth change limited to approved production HTML routes. Keep the landing page, raw Markdown, indexes, sandbox documentation, MCP, and discovery routes served. Never use a blanket `/docs*` redirect or send sandbox agent instructions to production examples.

## Release evidence and recovery

- Repository owner: workflow activation and a successful publishing run.
- Mintlify owner: manifest routes published, indexed, and readable through World Docs MCP, with complete agent instructions in Markdown.
- Auth owner: deployed guide content matches the intended source and environment; existing URLs, MCP resources, and access controls remain available.

After publication, use a small search/read check through available MCP connections and existing URL checks, within two minutes total and without browser QA or a new harness. Record passes, failures, and skipped checks. Missing deployment evidence remains explicit follow-up work.

For the hidden-page test, search World Docs MCP for the coding-agent guide and read `/agent-pass/build-with-a-coding-agent.mdx` through its docs filesystem tool. Verify the complete `Agent instructions` section and the Auth MCP URLs. To test updates from `temporal-apps`, publish a reviewed source change through the configured docs automation, merge its documentation PR, then read the changed section through World Docs MCP after Mintlify publishes it. A successful source sync and a refreshed MCP response are separate checks; a preview does not prove production indexing.

Investigate failed publishing runs, persistent empty searches, and guide-content mismatches. Compare content or source hashes, since different commits can contain identical guides. Revert and republish a bad documentation update; roll back a failing Auth release in its owning deployment. Keep existing Auth publication available throughout recovery.
