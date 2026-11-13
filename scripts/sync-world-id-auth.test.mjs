import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { renderGuide, syncGuides } from "./sync-world-id-auth.mjs";
import { renderQuickstartLayout } from "./world-id-auth-quickstart.mjs";
import { renderClientAuthentication } from "./world-id-auth-client-auth.mjs";

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

const quickstartChoices = [
  ["Authenticate through a browser", "Authorization Code Flow", "/agent-pass/connect-your-backend#sign-in-through-the-browser"],
  ["Authenticate a CLI or client without a browser callback", "Device Authorization Grant", "/agent-pass/connect-your-backend#sign-in-a-headless-agent-device-flow"],
  ["Require recent or specific authentication before an action", "Step-up authentication", "/agent-pass/step-up"],
  ["Pause an agent workflow for a human checkpoint", "Human checkpoints", "/agent-pass/step-up#human-checkpoints"],
  ["Use World ID for your application's primary sign-in", "Primary sign-in", "/agent-pass/connect-your-backend#primary-sign-in"],
  ["Authorize access to your MCP server", "MCP authorization", "/agent-pass/connect-your-auth-server"],
  ["Accept delegated access through an XAA-capable host", "Cross-App Access (XAA)", "/agent-pass/xaa"],
];
const quickstartTable = [
  "| Goal | Guide |",
  "| --- | --- |",
  ...quickstartChoices.map(([goal, title, href]) => `| ${goal} | [${title}](${href}) |`),
].join("\n");
const environmentTable = [
  "| Setting | Value |",
  "| --- | --- |",
  "| Issuer | `https://auth.world.org` |",
  "| Discovery | `https://auth.world.org/.well-known/openid-configuration` |",
  "| Developer portal | [Portal](https://auth.world.org/portal) |",
].join("\n");
const otherIntegrations = `These guides cover OIDC integration with World IdP. Use World IdP's
registrations, credentials, and identifiers only for that flow; IDKit proof
applications use their own.

- **IDKit uniqueness:** use a nullifier scoped to the application and action for
  one-use eligibility. Verify the proof on your backend and atomically reject a
  previously consumed nullifier. Check authentication freshness separately from
  stored uniqueness results. Follow the
  [IDKit setup and verification guide](https://docs.world.org/world-id/idkit/integrate).
- **IDKit sessions:** use repeated proofs of the saved \`session_id\` for account
  continuity. Each check still requires user interaction and a fresh proof.
  Use \`session_nullifier\` to identify a proof for replay checks. Manage
  application login cookies and World IdP browser
  sessions separately from proof sessions. Follow
  the [session-proof guide](https://docs.world.org/world-id/idkit/session-proofs)
  for registration, signed requests, verification, and replay checks.

**Legacy Sign In with World ID is deprecated.** Use World IdP's OIDC flow for
new sign-in integrations; legacy credentials and identities are not interchangeable
with World IdP's.

Apply the selected product's credential, environment, request-expiry, and replay
rules. Validate the resulting assurance and check business permissions in your application.
OIDC authentication remains repeatable. For one-use benefits, enforce your own rule with
atomic consumption in the
[appropriate identity scope](/agent-pass/id-tokens-and-identity#store-and-match-sub).`;
const quickstartContent = [
  "World IdP returns a signed authentication result and a sector-scoped account identifier.",
  '<span id="how-it-works" />',
  '<span id="integrate-in-four-steps" />',
  "## Choose your integration {#choose-your-integration}",
  "[Set up your client](/agent-pass/app-registration), then follow the path for your application.",
  quickstartTable,
  "Keep your existing sign-in and add step-up when your application needs World ID authentication before sensitive actions.",
  "## Environment values {#environment-values}",
  environmentTable,
  "Use registration, credentials, and discovery from the same environment.",
  "## Other World ID integrations {#other-world-id-integrations}",
  otherIntegrations,
  "## Get help from a coding agent {#get-help-from-a-coding-agent}",
  "Keep the final coding-agent setup link.",
].join("\n\n");

function visibilityParts(content, audience) {
  return [...content.matchAll(new RegExp(`<Visibility for="${audience}">([\\s\\S]*?)<\\/Visibility>`, "g"))]
    .map((match) => match[1]).join("\n");
}

test("quickstart cards and environment examples keep canonical agent tables, links, and anchors", () => {
  const rendered = renderQuickstartLayout(quickstartContent);
  const human = visibilityParts(rendered, "humans");
  const agents = visibilityParts(rendered, "agents");
  assert.equal([...human.matchAll(/<Card\s/g)].length, 7);
  for (const [goal, title, href] of quickstartChoices) {
    assert.ok(human.includes(`href="${href}"`), `Missing card destination: ${href}`);
    assert.ok(human.includes(goal), `Missing goal: ${goal}`);
    assert.ok(human.includes(title), `Missing guide title: ${title}`);
  }
  assert.ok(agents.includes(quickstartTable));
  assert.ok(agents.includes(environmentTable));
  assert.ok(agents.includes(otherIntegrations.split("\n\n**Legacy Sign In with World ID is deprecated.**")[0]));
  assert.ok(!human.includes(quickstartTable));
  assert.ok(!human.includes(environmentTable));
  for (const url of ["https://auth.world.org", "https://auth.world.org/.well-known/openid-configuration", "https://auth.world.org/portal"]) {
    assert.ok(human.includes(url), `Missing environment URL: ${url}`);
  }
  for (const id of ["how-it-works", "integrate-in-four-steps"]) {
    assert.equal(rendered.split(`<span id="${id}" />`).length - 1, 1);
  }
  assert.equal(rendered.split("{#choose-your-integration}").length - 1, 1);
  assert.equal(rendered.split("{#environment-values}").length - 1, 1);
  assert.ok(rendered.includes("Keep the final coding-agent setup link."));
  assert.ok(rendered.includes("Use registration, credentials, and discovery from the same environment."));
  assert.ok(human.includes("https://docs.world.org/world-id/idkit/integrate"));
  assert.ok(human.includes("https://docs.world.org/world-id/idkit/session-proofs"));
  assert.ok(human.includes("atomically reject any `nullifier`"));
  assert.ok(human.includes("reject reused `session_nullifier` values"));
  assert.ok(human.includes("requires user interaction and a fresh proof."));
  assert.equal(rendered.split("**Legacy Sign In with World ID is deprecated.**").length - 1, 1);
  assert.doesNotMatch(rendered, /^import /m);
});

test("quickstart adaptation rejects missing choices and changed reviewed identity guidance", () => {
  const missingChoice = quickstartContent.replace(/^\| Authenticate a CLI[^\n]+\n/m, "");
  assert.throws(() => renderQuickstartLayout(missingChoice), /quickstart|integration|table|row|card/i);
  const missingEnvironment = quickstartContent.replace(/^\| Discovery[^\n]+\n/m, "");
  assert.throws(() => renderQuickstartLayout(missingEnvironment), /quickstart|environment|table|row/i);
  const changedClaim = quickstartContent.replace("Each check still requires user interaction and a fresh proof.", "Repeated checks need no user interaction.");
  assert.throws(() => renderQuickstartLayout(changedClaim), /quickstart|IDKit|integration|source|review/i);
});

const clientAuthentication = `Authenticate at the token and device authorization endpoints with the client's
registered method:

| Method | How to send credentials |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| \`client_secret_basic\` (portal default) | Form-encode the client ID and secret and send them in the Authorization header as Basic credentials. An optional body \`client_id\` must match. |
| \`client_secret_post\` | Send \`client_id\` and \`client_secret\` in the form body, without an Authorization header. |
| \`private_key_jwt\` | Send \`client_id\`, \`client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer\`, and \`client_assertion\` in the form body, without an Authorization header. |

For \`private_key_jwt\`, register the public JWKS in the portal and keep the private
key in your backend. The assertion is a compact RS256 JWT:

- \`kid\` selects a registered RSA key (2048–8192 bits). It may be omitted when
  exactly one key is registered.
- \`iss\` and \`sub\` are both the client ID.
- The single \`aud\` is \`https://auth.world.org\` or the exact endpoint being called.
- Include \`iat\`, \`exp\` (at most one hour after \`iat\`), and a unique \`jti\` of at
  most 256 bytes. Expiration is strict; \`iat\` and optional \`nbf\` allow 30 seconds
  of clock skew.

Use a fresh assertion for every request, retry, and device poll, including after
\`authorization_pending\`. Assertions are single-use across endpoints. A rejected
assertion returns HTTP 400 \`invalid_client\`.
Keep request bodies, Authorization headers, and callback query strings out of logs.`;
const clientAuthenticationContent = [
  "## Register your application {#register-your-application}",
  "Preserve the registration workflow.",
  "## Client authentication {#client-authentication}",
  clientAuthentication,
  "## Manage credentials and callbacks {#manage-credentials-and-callbacks}",
  "Keep rotation, sectors, and account-linking rules unchanged.",
].join("\n\n");

test("client authentication examples keep all methods and their complete canonical rules for agents", () => {
  const rendered = renderClientAuthentication(clientAuthenticationContent);
  const human = visibilityParts(rendered, "humans");
  const agents = visibilityParts(rendered, "agents");
  assert.match(human, /<CodeGroup(?:\s|>)/);
  for (const method of ["client_secret_basic", "client_secret_post", "private_key_jwt"]) {
    assert.ok(human.includes(method), `Missing method example: ${method}`);
  }
  assert.match(human, /form.encod/i);
  assert.ok(human.includes("Authorization: Basic"));
  assert.ok(human.includes("client_assertion_type=urn%3Aietf%3Aparams%3Aoauth%3Aclient-assertion-type%3Ajwt-bearer"));
  assert.ok(human.includes('```json title="JWT header"'));
  assert.ok(human.includes('```json title="JWT payload"'));
  assert.ok(agents.includes(clientAuthentication));
  for (const detail of ["2048–8192", "256 bytes", "30 seconds", "authorization_pending", "HTTP 400", "RS256"]) {
    assert.ok(rendered.includes(detail), `Missing client authentication rule: ${detail}`);
  }
  assert.ok(rendered.includes("Preserve the registration workflow."));
  assert.ok(rendered.includes("Keep rotation, sectors, and account-linking rules unchanged."));
  assert.equal(rendered.split("{#client-authentication}").length - 1, 1);
  assert.doesNotMatch(rendered, /^import /m);
});

test("client authentication adaptation fails when the reviewed methods or section boundary change", () => {
  const missingMethod = clientAuthenticationContent.replace(/^\| `client_secret_post`[^\n]+\n/m, "");
  assert.throws(() => renderClientAuthentication(missingMethod), /client|auth|method|table|row/i);
  const missingBoundary = clientAuthenticationContent.replace("## Manage credentials and callbacks {#manage-credentials-and-callbacks}", "## Renamed section {#renamed-section}");
  assert.throws(() => renderClientAuthentication(missingBoundary), /client|auth|section|boundar/i);
});
