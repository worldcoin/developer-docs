# developer-docs

Source for the official World developer documentation, published at **[docs.world.org](https://docs.world.org)**. The site is built with [Mintlify](https://mintlify.com) — content lives in `.mdx` files and the structure is defined in `docs.json`.

## What's documented here

- **World ID** (`world-id/`) — IDKit SDKs (JS, React, Swift, Kotlin, Go), Sign in with World ID, credentials, Selfie Check, on-chain verification, API reference.
- **Mini Apps** (`mini-apps/`) — building applications that run inside World App, including commands, sharing, growth, and the MiniKit reference.
- **World Chain** (`world-chain/`) — quick start, provider integrations, tokens, and developer reference for the chain.
- **AgentKit and agents** (`agents/`) — distinguishing human-backed agents from bots, plus Hats and human-in-the-loop flows.
- **MCP servers** (`mcp/`) — World's Model Context Protocol integrations (developer portal, world-docs).
- **OpenAPI specs** (`openapi/`) — machine-readable specs for the World ID and Developer Portal APIs.

## How the repo is organized

The site is content-first: each product area is a top-level directory of `.mdx` pages, and `docs.json` is the single source of truth that wires those pages into the sidebar, tabs, theme, and SEO metadata. Adding a page means dropping an `.mdx` file into the relevant product directory and registering its path under `navigation` in `docs.json` — nothing else routes content.

A few supporting conventions sit alongside the product directories:

- **Reusable content** lives in `snippets/` as MDX fragments that pages import, so shared callouts and instructions don't drift.
- **API references** are generated from machine-readable specs in `openapi/`, not hand-written, which keeps them aligned with the underlying APIs.
- **Branding and styling** (the World Pro MVP font, Tailwind config, custom CSS, icons, and images) live at the root and layer on top of the default Mintlify theme.
- **Quality gates** — spellcheck (`cspell.json`) and broken-link detection — run against the whole tree, so new content is checked the same way as existing content.

## Local development

Requires Node and [pnpm](https://pnpm.io). From the repo root (where `docs.json` lives):

```sh
pnpm install
pnpm dev          # start the Mintlify dev server
```

Other useful scripts:

```sh
pnpm spellcheck   # run cspell across markdown / source files
pnpm check-links  # detect broken internal links
```

## Contributing

- Edit or add `.mdx` pages, then register them under `navigation` in `docs.json` so they appear in the sidebar.
- Add new terms to `cspell.json` rather than disabling the check.
- For shared content used in multiple places, add a fragment under `snippets/` and import it.
- Open a PR against `main`; the docs deploy from there.
