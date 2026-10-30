# IDP publishing

<!-- cspell:words multirepo -->

Author IDP guides in `worldcoin/temporal-apps/apps/idpapi/mcp/guides/*.md`. The Auth portal and MCP keep consuming those files. `developer-docs` publishes a generated MDX representation of the same content.

## Files and ownership

- `scripts/sync-world-id-auth.mjs` converts the source Markdown without an LLM or runtime dependencies beyond Node.js.
- `.mintlify/world-id-auth-pages.json` allowlists the eleven source guides and records their existing destination slugs, publishing metadata, and asset mapping.
- `.mintlify/world-id-auth-source.json` records the source commit used for the generated pages and assets.
- `world-id-auth/*.mdx` are generated output. Change the canonical Markdown, manifest, or converter and regenerate instead of editing these pages directly.
- `.github/workflows/sync-world-id-auth.yml` proposes updates through a PR. Global navigation in `docs.json` remains separately maintained.

The converter resolves `{{issuer}}` to the production issuer, preserves documented sandbox examples, maps documentation links, and escapes Markdown syntax for MDX. It retains the complete coding-agent instructions and applies the approved public introduction for `world-id-users.md`. That public adaptation does not change MCP authentication or account-tool permissions. See [the source and cutover map](world-id-auth-migration.md) for coverage and URL requirements.

The federation SVG is copied from `temporal-apps/apps/idpportal/public/assets/mcp-federation.svg` to `images/world-id-auth/mcp-federation.svg`. Edit the source illustration and regenerate when the diagram changes.

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
