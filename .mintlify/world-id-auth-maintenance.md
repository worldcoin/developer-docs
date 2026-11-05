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

- Change product guidance in the canonical Markdown, then regenerate. Do not edit generated `world-id-auth/*.mdx` bodies independently.
- Preserve complete sections, tables, examples, errors, limitations, and agent instructions, including everything after `Agent instructions`. Auth's HTML may omit agent-only sections; its raw Markdown and MCP are the complete sources.
- Use the manifest for renamed routes, old heading aliases, and approved layout adaptations. Keep existing public URLs useful when the source reorganizes or merges topics. Do not restore obsolete product guidance merely to retain an old route.
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

The workflow opens or updates a review PR on `codex/sync-world-id-auth` and never merges automatically. Configure a scoped GitHub App with source contents read access and destination contents/pull-request write access. In `developer-docs`, set Actions variable `IDP_DOCS_APP_ID` and secret `IDP_DOCS_APP_PRIVATE_KEY`.

Automatic synchronization is active only after the workflow is merged to `main`, the App and credentials are configured, and a run succeeds. Mintlify publishes after the documentation PR merges through the site's existing configuration. A source merge or a local pass does not establish a production release.

## URLs and MCP

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

Investigate failed publishing runs, persistent empty searches, and guide-content mismatches. Compare content or source hashes, since different commits can contain identical guides. Revert and republish a bad documentation update; roll back a failing Auth release in its owning deployment. Keep existing Auth publication available throughout recovery.
