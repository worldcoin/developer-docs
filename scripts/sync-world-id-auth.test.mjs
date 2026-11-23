import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { renderGuide, syncGuides } from "./sync-world-id-auth.mjs";

const page = {
  source: "getting-started.md",
  destination: "agent-pass/quickstart.mdx",
  title: "Quickstart",
  description: "Connect your application.",
};
const config = {
  repository: "worldcoin/temporal-apps",
  sourceDirectory: "apps/idpapi/mcp/guides",
  issuer: "https://auth.world.org",
  pages: [page],
};
const sourceCommit = "a".repeat(40);
const codingPage = { ...page, source: "coding-agent-setup.md", destination: "agent-pass/build-with-a-coding-agent.mdx" };
const codingSections = [
  "Agent instructions",
  "Developer-portal permission",
  "Register an application with your agent",
  "Configure an existing application with your agent",
  "Publish a benefit listing",
];
const codingGuide = "# Set up your coding agent\n\n" + codingSections.map((heading) => `## ${heading}\n\nComplete ${heading} workflow.\n`).join("\n");

async function fixture(t) {
  const directory = await mkdtemp(path.join(tmpdir(), "idp-doc-sync-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const sourceDir = path.join(directory, "source");
  const outputDir = path.join(directory, "output");
  await mkdir(path.join(sourceDir, config.sourceDirectory), { recursive: true });
  await mkdir(outputDir);
  return {
    sourceDir,
    outputDir,
    async write(name, content) {
      await writeFile(path.join(sourceDir, config.sourceDirectory, name), content);
    },
  };
}

test("preserves complete guide instructions and code while adding page metadata", () => {
  const markdown = [
    "# Source title",
    "",
    "## Agent instructions",
    "",
    "Keep this and every later section.",
    "",
    "```json",
    '{ "issuer": "{{issuer}}", "claim": "{subject}" }',
    "```",
    "",
    "## Register an application",
    "",
    "Final registration instructions.",
  ].join("\n");
  const rendered = renderGuide(markdown, page, config);
  assert.match(rendered, /^---\ntitle: "Quickstart"/);
  assert.match(rendered, /## Agent instructions \{#agent-instructions\}/);
  assert.match(rendered, /## Register an application/);
  assert.match(rendered, /Final registration instructions\./);
  assert.ok(rendered.includes('```json\n{ "issuer": "https://auth.world.org", "claim": "{subject}" }\n```'));
});

test("maps guide links and raw Markdown prompts without moving service endpoints", () => {
  const markdown = [
    "# Guide",
    "",
    "[Start]({{issuer}}/docs/guides/getting-started#next)",
    "Read {{issuer}}/docs/guides/getting-started.md with your agent.",
    "Use `{{issuer}}/api/v1/token` and `{{issuer}}/mcp/developer`.",
  ].join("\n");
  const rendered = renderGuide(markdown, page, config);
  assert.ok(rendered.includes("[Start](/agent-pass/quickstart#next)"));
  assert.ok(rendered.includes("https://docs.world.org/agent-pass/quickstart.md"));
  assert.ok(rendered.includes("`https://auth.world.org/api/v1/token`"));
  assert.ok(rendered.includes("`https://auth.world.org/mcp/developer`"));
  assert.ok(!rendered.includes("/docs/guides/"));
});

test("keeps sandbox guide links and raw Markdown on the sandbox host", () => {
  const sandboxGuide = "https://sandbox.auth.world.org/docs/guides/getting-started";
  const sandboxMarkdown = `${sandboxGuide}.md?source=agent#next`;
  const sandboxOnlyGuide = "https://sandbox.auth.world.org/docs/guides/sandbox-only-guide";
  const markdown = [
    "# Guide",
    "",
    `[Sandbox](${sandboxGuide}#next)`,
    `Read ${sandboxMarkdown} with your agent.`,
    `[Sandbox only](${sandboxOnlyGuide})`,
    "[Production](https://auth.world.org/docs/guides/getting-started#next)",
  ].join("\n");
  const rendered = renderGuide(markdown, page, config);
  assert.ok(rendered.includes(`[Sandbox](${sandboxGuide}#next)`));
  assert.ok(rendered.includes(sandboxMarkdown));
  assert.ok(rendered.includes(`[Sandbox only](${sandboxOnlyGuide})`));
  assert.ok(rendered.includes("[Production](/agent-pass/quickstart#next)"));
});

test("maps relative guide links to browser pages while keeping explicit raw Markdown URLs", () => {
  const markdown = "# Guide\n\n[Instructions](./getting-started.md#next)\nRead {{issuer}}/docs/guides/getting-started.md?source=agent#next\n";
  const rendered = renderGuide(markdown, page, config);
  assert.ok(rendered.includes("[Instructions](/agent-pass/quickstart#next)"));
  assert.ok(rendered.includes("https://docs.world.org/agent-pass/quickstart.md?source=agent#next"));
});

test("inlines environment guidance without a snippet dependency", () => {
  const rendered = renderGuide("# Guide\n\nKeep the canonical introduction.\n", { ...page, environmentNote: true }, config);
  assert.ok(rendered.includes("<Note>"));
  assert.ok(rendered.includes("`https://auth.world.org`"));
  assert.ok(rendered.includes("`https://sandbox.auth.world.org`"));
  assert.ok(rendered.includes("Keep the canonical introduction."));
  assert.doesNotMatch(rendered, /^import /m);
  assert.ok(!rendered.includes("/snippets/"));
});

test("inlines the current MCP diagram with separate upstream and downstream code exchanges", () => {
  const diagramPage = { ...page, source: "mcp-authorization.md", federationDiagram: true };
  const markdown = "# MCP authorization\n\n## Browser authorization\n\n![Token handoff]({{issuer}}/portal/assets/mcp-authorization.svg)\n\nKeep the two exchanges separate.\n";
  const rendered = renderGuide(markdown, diagramPage, { ...config, pages: [diagramPage] });
  assert.ok(rendered.includes("```mermaid\n"));
  assert.ok(rendered.includes("Auth->>Issuer: Exchange upstream code"));
  assert.ok(rendered.includes("Client->>Auth: Exchange downstream code"));
  assert.ok(rendered.includes("Keep the two exchanges separate."));
  assert.doesNotMatch(rendered, /^import /m);
  assert.ok(!rendered.includes(".svg"));
  assert.throws(() => renderGuide(markdown.replace("mcp-authorization.svg", "changed.svg"), diagramPage, { ...config, pages: [diagramPage] }), /illustration changed/);
});

test("a derived human-checkpoint page preserves its section and links back to the full step-up guide", () => {
  const primary = { ...page, source: "step-up.md", destination: "agent-pass/step-up.mdx" };
  const derived = { ...primary, destination: "agent-pass/human-in-the-loop.mdx", section: "Human checkpoints", sectionEnd: "Prevent stale or duplicate operations" };
  const derivedConfig = { ...config, pages: [primary, derived] };
  const markdown = [
    "# Step-up authentication",
    "",
    "## Implement step-up",
    "",
    "Keep every backend validation step in the full guide.",
    "",
    "## Human checkpoints",
    "",
    "Follow [step-up](#implement-step-up) and [approval](#optional-collect-action-approval-in-your-application).",
    "",
    "### Optional: collect action approval in your application",
    "",
    "Keep the saved action bound to the authentication attempt.",
    "Follow [one-use rules](#prevent-stale-or-duplicate-operations).",
    "",
    "## Prevent stale or duplicate operations",
    "",
    "Reconcile before retrying.",
  ].join("\n");
  const rendered = renderGuide(markdown, derived, derivedConfig);
  assert.ok(rendered.includes("## Human checkpoints {#human-checkpoints}"));
  assert.ok(rendered.includes("Keep the saved action bound to the authentication attempt."));
  assert.ok(rendered.includes("[approval](#optional-collect-action-approval-in-your-application)"));
  assert.ok(rendered.includes("[step-up](/agent-pass/step-up#implement-step-up)"));
  assert.ok(rendered.includes("[one-use rules](/agent-pass/step-up#prevent-stale-or-duplicate-operations)"));
  assert.ok(!rendered.includes("Reconcile before retrying."));
  const complete = renderGuide(markdown + "\n[Full guide]({{issuer}}/docs/guides/step-up#human-checkpoints)\n", primary, derivedConfig);
  assert.ok(complete.includes("Keep every backend validation step in the full guide."));
  assert.ok(complete.includes("Reconcile before retrying."));
  assert.ok(complete.includes("[Full guide](/agent-pass/step-up#human-checkpoints)"));
  for (const changed of [markdown.replace("## Human checkpoints", "## Renamed checkpoints"), markdown.replace("## Prevent stale or duplicate operations", "## New boundary")]) {
    assert.throws(() => renderGuide(changed, derived, derivedConfig), /derived guide|boundary/i);
  }
});

test("keeps both Auth MCP endpoints, discovery, permissions, and resource IDs on their service origins", () => {
  const values = [
    "https://auth.world.org/mcp",
    "https://auth.world.org/mcp/developer",
    "https://sandbox.auth.world.org/mcp",
    "https://sandbox.auth.world.org/mcp/developer",
    "https://auth.world.org/.well-known/oauth-protected-resource/mcp/developer",
    "https://auth.world.org/.well-known/openid-configuration",
    "https://auth.world.org/api/v1/authorize",
    "https://sandbox.auth.world.org/api/v1/token",
    "https://auth.world.org/portal/connections",
    "worldid://guides/<id>",
    "developer-portal:manage",
    "world-id:read",
  ];
  const rendered = renderGuide("# Guide\n\n" + values.map((value) => `Use \`${value}\`.`).join("\n"), page, config);
  for (const value of values) assert.ok(rendered.includes(`\`${value}\``), value);
  // Similar URL paths must not be rewritten through a partial guide-name match.
  const html = "https://auth.world.org/docs/guides/getting-started.html";
  assert.ok(renderGuide(`# Guide\n\nUse \`${html}\`.`, page, config).includes(`\`${html}\``));
});

test("keeps the full coding-agent instructions and every later workflow", () => {
  const rendered = renderGuide(codingGuide, codingPage, { ...config, pages: [codingPage] });
  for (const heading of codingSections) assert.ok(rendered.includes(`Complete ${heading} workflow.`));
  assert.ok(rendered.trimEnd().endsWith("Complete Publish a benefit listing workflow."));
});

test("rejects a coding-agent guide truncated before or after Agent instructions", () => {
  const codingConfig = { ...config, pages: [codingPage] };
  assert.throws(() => renderGuide("# Guide\n\nConnect your agent.\n", codingPage, codingConfig), /Incomplete coding-agent guide/);
  for (const heading of codingSections) {
    const truncated = codingGuide.slice(0, codingGuide.indexOf(`## ${heading}`));
    assert.throws(() => renderGuide(truncated, codingPage, codingConfig), /Incomplete coding-agent guide/);
    const empty = codingGuide.replace(`Complete ${heading} workflow.`, "");
    assert.throws(() => renderGuide(empty, codingPage, codingConfig), /Incomplete coding-agent guide/);
  }
});

test("preserves legacy aliases and rejects a renamed source heading that would remove them", () => {
  const aliasPage = { ...page, anchorAliases: { "authenticate-through-the-browser": ["sign-in-through-the-browser"] } };
  const aliasConfig = { ...config, pages: [aliasPage] };
  const rendered = renderGuide("# Guide\n\n## Authenticate through the browser\n\nSign in.\n", aliasPage, aliasConfig);
  assert.ok(rendered.includes('<span id="sign-in-through-the-browser" />'));
  assert.ok(rendered.includes("{#authenticate-through-the-browser}"));
  assert.throws(() => renderGuide("# Guide\n\n## Renamed browser section\n\nSign in.\n", aliasPage, aliasConfig), /Missing heading for legacy anchor aliases/);
});

test("retains an old introduction anchor when its setup instructions move into the introduction", () => {
  const aliasPage = { ...page, introAliases: ["configure-your-auth-server"] };
  const rendered = renderGuide("# Guide\n\nFirst configure your auth server.\n", aliasPage, { ...config, pages: [aliasPage] });
  assert.ok(rendered.includes('<span id="configure-your-auth-server" />\n\nFirst configure your auth server.'));
});

test("does not duplicate a legacy alias already supplied by its source heading", () => {
  const id = "optional-collect-action-approval-in-your-application";
  const aliasPage = { ...page, introAliases: [id], anchorAliases: { [id]: [id] } };
  const markdown = "# Guide\n\n### Optional: collect action approval in your application\n\nKeep the exact action bound to the attempt.\n";
  const rendered = renderGuide(markdown, aliasPage, { ...config, pages: [aliasPage] });
  assert.ok(rendered.includes(`{#${id}}`));
  assert.ok(!rendered.includes(`<span id="${id}"`));
});

test("escapes MDX expressions and angle text while leaving inline code literal", () => {
  const rendered = renderGuide("# Guide\n\nA value is {claim} and <subject>. Use `{inline}`.\n", page, config);
  assert.ok(/(?:\\\{|&#123;|&lbrace;)claim(?:\\\}|&#125;|&rbrace;)/.test(rendered));
  assert.ok(rendered.includes("&lt;subject&gt;") || rendered.includes("\\<subject\\>"));
  assert.ok(rendered.includes("`{inline}`"));
});

test("rejects unmapped guide links and unknown source placeholders", () => {
  assert.throws(() => renderGuide("# Guide\n\n[Missing]({{issuer}}/docs/guides/not-approved)", page, config));
  assert.throws(() => renderGuide("# Guide\n\nUse {{unknown}}/api.", page, config));
});

test("adapts only the approved public user introduction and preserves account authorization", () => {
  const userPage = { ...page, source: "world-id-users.md", publicUserGuide: true };
  const markdown = [
    "# For World ID users",
    "",
    "Your agent can read this guide because you authenticated with World ID and approved",
    "its OAuth access. This guide contains general guidance, not private account data.",
    "",
    "## What you authorized",
    "",
    "With the `world-id:read` scope on `{{issuer}}/mcp`, your agent can read account information.",
  ].join("\n");
  const rendered = renderGuide(markdown, userPage, { ...config, pages: [userPage] });
  assert.ok(!rendered.includes("because you authenticated"));
  assert.ok(rendered.includes("`world-id:read`"));
  assert.ok(rendered.includes("`https://auth.world.org/mcp`"));
  assert.ok(rendered.includes("not private account data"));
});

test("regenerates deterministically and ignores files outside the approved guide list", async (t) => {
  const f = await fixture(t);
  await f.write(page.source, "# Guide\n\n## Agent instructions\n\nKeep the complete guide.\n");
  await f.write("unapproved.md", "# Do not publish\n");
  const options = { ...f, sourceCommit, config };
  const first = await syncGuides(options);
  assert.ok(first.changed.includes(page.destination));
  const provenancePath = path.join(f.outputDir, ".mintlify/world-id-auth-source.json");
  const provenance = await readFile(provenancePath, "utf8");
  const second = await syncGuides({ ...options, sourceCommit: "b".repeat(40) });
  assert.deepEqual(second.changed, []);
  assert.equal(await readFile(provenancePath, "utf8"), provenance);
  assert.deepEqual(await readdir(path.join(f.outputDir, "agent-pass")), ["quickstart.mdx"]);
});

test("a missing approved source fails before any destination is written", async (t) => {
  const f = await fixture(t);
  await f.write(page.source, "# Guide\n\nExisting source.\n");
  const missing = { ...page, source: "missing.md", destination: "agent-pass/missing.mdx" };
  await assert.rejects(() => syncGuides({ ...f, sourceCommit, config: { ...config, pages: [page, missing] } }));
  assert.deepEqual(await readdir(f.outputDir), []);
});

test("a truncated coding-agent source fails before any destination is written", async (t) => {
  const f = await fixture(t);
  await f.write(page.source, "# Guide\n\nExisting source.\n");
  await f.write(codingPage.source, "# Set up your coding agent\n\nConnect the agent.\n");
  await assert.rejects(() => syncGuides({ ...f, sourceCommit, config: { ...config, pages: [page, codingPage] } }), /Incomplete coding-agent guide/);
  assert.deepEqual(await readdir(f.outputDir), []);
});

test("published IDP pages stay discoverable and include complete machine-readable agent instructions", async () => {
  const manifest = JSON.parse(await readFile(new URL("../.mintlify/world-id-auth-pages.json", import.meta.url), "utf8"));
  const site = JSON.parse(await readFile(new URL("../docs.json", import.meta.url), "utf8"));
  const navigation = JSON.stringify(site.navigation);
  assert.equal(new Set(manifest.pages.map((entry) => entry.destination)).size, manifest.pages.length);
  for (const entry of manifest.pages) {
    const route = entry.destination.replace(/\.mdx$/, "");
    assert.ok(site.seo?.indexing === "all" || navigation.includes(JSON.stringify(route)), `Not indexed: ${route}`);
    const generated = await readFile(new URL(`../${entry.destination}`, import.meta.url), "utf8");
    assert.doesNotMatch(generated, /\/world-id-auth\//, `Outdated docs route: ${route}`);
    assert.doesNotMatch(generated, /^noindex:\s*true\s*$/m, `Excluded from search: ${route}`);
    assert.doesNotMatch(generated, /^import [^\n]+ from ["']\/snippets\//m, `Unexpected snippet dependency: ${route}`);
  }
  const instructions = await readFile(new URL("../agent-pass/build-with-a-coding-agent.mdx", import.meta.url), "utf8");
  for (const heading of codingSections) assert.ok(instructions.includes(`## ${heading} {#`), `Missing section: ${heading}`);
  assert.ok(instructions.includes("Read https://docs.world.org/agent-pass/build-with-a-coding-agent.md"));
  assert.ok(instructions.includes("https://auth.world.org/mcp/developer"));
  assert.ok(instructions.includes("https://sandbox.auth.world.org/mcp/developer"));
  assert.ok(instructions.includes("`worldid://guides/<id>`"));
  assert.ok(instructions.includes("`resources/read`"));
  const userGuide = await readFile(new URL("../agent-pass/use-world-id-with-your-agent.mdx", import.meta.url), "utf8");
  assert.ok(userGuide.includes("https://auth.world.org/mcp"));
  assert.ok(userGuide.includes("`world-id:read`"));
});

test("the compatibility contract keeps legacy Auth routes and protected MCP resources", async () => {
  const manifest = JSON.parse(await readFile(new URL("../.mintlify/world-id-auth-pages.json", import.meta.url), "utf8"));
  const contract = JSON.parse(await readFile(new URL("../.mintlify/world-id-auth-compatibility.json", import.meta.url), "utf8"));
  const site = JSON.parse(await readFile(new URL("../docs.json", import.meta.url), "utf8"));
  const redirects = new Map(site.redirects.map((redirect) => [redirect.source, redirect.destination]));
  for (const entry of manifest.pages) {
    assert.ok(entry.destination.startsWith("agent-pass/"));
    const route = `/${entry.destination.replace(/\.mdx$/, "")}`;
    const legacyRoute = route.replace("/agent-pass/", "/world-id-auth/");
    assert.equal(redirects.get(legacyRoute), route);
    assert.equal(redirects.get(`${legacyRoute}.md`), `${route}.md`);
  }
  const ids = [...new Set(manifest.pages.map((entry) => entry.source.replace(/\.md$/, "")))];
  assert.deepEqual(contract.guideResources.map((guide) => guide.id).sort(), ids.sort());
  const routes = new Map(contract.legacyHtmlRoutes.map((route) => [route.path, route.docsPath]));
  for (const entry of manifest.pages.filter((entry) => !entry.publicUserGuide && !entry.section)) {
    const id = entry.source.replace(/\.md$/, "");
    assert.equal(routes.get(`/docs/guides/${id}`), `/${entry.destination.replace(/\.mdx$/, "")}`);
    assert.deepEqual(contract.guideResources.find((guide) => guide.id === id), { id, audience: "developer", requiresAuth: false });
  }
  assert.equal(routes.get("/docs/guides/human-in-the-loop"), "/agent-pass/human-in-the-loop");
  assert.equal(routes.get("/docs/guides/federation"), "/agent-pass/connect-your-auth-server");
  assert.equal(routes.get("/docs/guides/mcp-oauth"), "/agent-pass/build-with-a-coding-agent");
  assert.equal(routes.has("/docs/guides/world-id-users"), false);
  assert.deepEqual(contract.guideResources.find((guide) => guide.id === "world-id-users"), { id: "world-id-users", audience: "user", requiresAuth: true });
  assert.equal(contract.mode, "dual-publication");
  assert.deepEqual(contract.preserveOnAuth.mcpPaths, ["/mcp", "/mcp/developer"]);
  assert.equal(contract.preserveOnAuth.resourceUriPrefix, "worldid://guides/");
  assert.equal(contract.preserveOnAuth.rawAgentGuidePath, "/docs/guides/coding-agent-setup.md");
  assert.equal(contract.markdownEquivalent.docsPath, "/agent-pass/build-with-a-coding-agent.md");
  assert.equal(contract.legacyHtmlPolicy.includeTrailingSlash, true);
});
