# IDP publishing

<!-- cspell:words multirepo -->

Author IDP guides in `worldcoin/temporal-apps/apps/idpapi/mcp/guides/*.md`. The Auth portal and MCP keep consuming those files. `developer-docs` publishes a generated MDX representation of the same content.

## Files and ownership

- `scripts/world-id-auth-presentation.mjs` applies the explicit human-reading presets in the page manifest. Reusable presentation fragments live in `snippets/world-id-auth/`.
- `.mintlify/world-id-auth-reading-edits.json` records the reviewed prose replacements for `compact` human views. Each replacement must match exactly once; a changed source paragraph requires a new editorial review before regeneration. The complete agent reference does not use these edits.
- `scripts/sync-world-id-auth.mjs` converts the source Markdown without an LLM or runtime dependencies beyond Node.js.
- `.mintlify/world-id-auth-pages.json` allowlists eleven source guides and records their destination slugs, reading presets, metadata and asset mapping. Two additional pages are derived from the OIDC and coding-agent sources, without additional source files.
- `.mintlify/world-id-auth-source.json` records the source commit used for the generated pages and assets.
- `world-id-auth/*.mdx` are generated output. Change the canonical Markdown, manifest, or converter and regenerate instead of editing these pages directly.
- `.github/workflows/sync-world-id-auth.yml` proposes updates through a PR. Global navigation in `docs.json` remains separately maintained.

The converter resolves `{{issuer}}` to the production issuer, preserves documented sandbox examples, maps documentation links, and escapes Markdown syntax for MDX. It retains the complete coding-agent instructions and applies the approved public introduction for `world-id-users.md`. That public adaptation does not change MCP authentication or account-tool permissions. See [the source and cutover map](world-id-auth-migration.md) for coverage and URL requirements.

The federation SVG remains copied and tracked for source comparison. The human federation page uses the native Mermaid fragment `snippets/world-id-auth-federation.mdx`. Keep it aligned with source changes.

## Reading adaptations and release order

The faithful migration in #225 ships first. Review this draft follow-up afterward; it is not part of the initial cutover. No Auth deployment or MCP access policy changes are included.

The browser page links its old device anchors to `device-flow.mdx`, which retains the complete extracted section. Coding-agent setup keeps human configuration steps and native host tabs; its full source is generated as `coding-agent-reference.mdx`, including every permission, approval and management section. Raw Markdown prompts point to that complete reference. Missing expected section boundaries fail generation instead of silently dropping content.

The presentation adapter also adds learning snippets and clarifies freshness wording against the existing passkey contract. Propose those wording corrections upstream in temporal-apps. The user-facing connection section retains access lifetime, refresh inactivity and revocation behavior while leaving digest-retention internals in the canonical authenticated MCP guide.

Source updates still regenerate every output. Review the canonical diff alongside changes in the adapter and snippets. Keep source protocol behavior and local presentation responsibilities distinct.

Compact views keep one explanation per teaching resource: the freshness sequence owns the clock example, the connection table owns host/access checks, and screenshots keep short captions. The browser procedure still states callback validation on success and error, the one-use five-minute code lifetime, and ID-token validation. The federation guide still distinguishes its two code exchanges, which the token-handoff diagram does not show. Testing retains its failure table and fixture limitations. These are implementation requirements, not repeated descriptions to remove.

The portal illustrations use real production screenshots captured on 2026-11-04: sign-in, the application-registration form, callback settings, and the empty developer-agent connections view. The sign-in image explains access only; the form and settings images use example values that were not saved. The developer-agent image is explicitly an empty state, not evidence of a completed connection or approval. Presentation images live in `images/world-id-auth/portal/`; their origin and purpose are recorded in `.mintlify/world-id-auth-screenshots.json`. These documentation-owned assets are committed with their snippets rather than copied from the canonical guide repository.

No credentials, applications, connections or approval requests were created during capture. Temporary form edits were discarded. The approved crops exclude account identity, existing application identifiers and real callback values. No pending-approval screen was available; do not invent one. Mobile sandbox screenshots require the actual sandbox app. Keep every field name and required action in text as well as in the screenshot; images supplement the complete agent instructions. Refresh the captured image and its metadata together when portal labels or layout change.

The complete Node HTTPS learning example follows the versioned openid-client documentation. It requires real HTTPS, a registered client and secure configuration. Its in-memory store is for a single-process demonstration. It has not been exercised against an issuer and must not be described as an end-to-end validated integration.

Mintlify Autopilot may maintain other pages. It must not independently edit generated IDP pages. IDP content proposals belong in the canonical Markdown and then pass through this publisher.

## How multirepo applies here

Multirepo publishing lets a product team keep its documentation beside its code while a separate repository publishes the combined documentation site. The source files remain owned by the product repository. The publishing repository receives generated copies.

Mintlify's [official multirepo action](https://github.com/mintlify/multirepo-action) copies child documentation folders and merges their `docs.json` navigation into a parent configuration. It can propose those updates through a PR.

This IDP publisher uses the same one-way model with a focused workflow instead of that action. The existing sources are shared with Auth MCP and need issuer substitution, renamed destination routes, MDX escaping, and an approved public user-guide introduction. The focused publisher preserves the existing site navigation and avoids adding a Mintlify configuration to the canonical guide directory. No content needs to move out of `temporal-apps`.

## Generate locally

Check out `temporal-apps` beside `developer-docs`, and select the source commit you intend to publish. From the `developer-docs` root, run:

```sh
node scripts/sync-world-id-auth.mjs \
  --source-dir ../temporal-apps \
  --source-commit <40-character-source-commit>
```

Pass the full commit of the source checkout. Review the generated pages and source lock together. To compare committed output with that source without writing files, add `--check`:

```sh
node scripts/sync-world-id-auth.mjs \
  --source-dir ../temporal-apps \
  --source-commit <40-character-source-commit> \
  --check
```

The initial generation is pinned to `9eedf2dee3a8fb1d864e02c59a98982a2c811e61`, the source already reviewed for this migration. Future publishing PRs record their own source commit in the lock and PR description.

## Configure automation

The repository owner must install a scoped GitHub App with access to `worldcoin/temporal-apps` and `worldcoin/developer-docs`. It needs source contents read access, destination contents write access, and destination pull-request write access. Scope its installation to the required repositories.

Configure these values in `developer-docs`:

| Setting | Value |
| --- | --- |
| Actions variable `IDP_DOCS_APP_ID` | GitHub App ID |
| Actions secret `IDP_DOCS_APP_PRIVATE_KEY` | GitHub App private key |

Merge the workflow to `main` to enable its hourly schedule. Manual dispatch accepts `source_ref`, defaulting to `main`, and resolves it to a source commit. The workflow checks out that source, generates the pages, and opens or updates the PR branch `codex/sync-world-id-auth`. A run with no generated changes should produce no publishing PR update.

Until the workflow is merged, credentials are configured, and a run succeeds, automatic IDP synchronization is not active. Creating these files does not install the App, grant repository access, or configure secrets.

## Review and publication

Review each publishing PR against its linked source commit. Check content changes, release status, environment values, and any converter or manifest changes. A source merge alone does not prove that the described behavior is deployed. Hold or correct documentation that would present unreleased behavior as available.

Merge the publishing PR through the normal documentation review process. The workflow never merges automatically. Mintlify publication follows the site's existing deployment configuration after merge.

This publisher does not modify `temporal-apps`, deploy Auth or MCP services, install legacy redirects, or retire existing Auth documentation. Keep those cutover changes in their owning deployments.

If a source change cannot be represented safely, correct the canonical Markdown or converter and rerun. Do not repair generated pages by hand or configure Autopilot to maintain a second version of their content.
