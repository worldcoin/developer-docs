import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { renderGuide, syncGuides } from "./sync-world-id-auth.mjs";

const page = {
  source: "getting-started.md",
  destination: "world-id-auth/quickstart.mdx",
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
  assert.ok(rendered.includes("[Start](/world-id-auth/quickstart#next)"));
  assert.ok(rendered.includes("https://docs.world.org/world-id-auth/quickstart.md"));
  assert.ok(rendered.includes("`https://auth.world.org/api/v1/token`"));
  assert.ok(rendered.includes("`https://auth.world.org/mcp/developer`"));
  assert.ok(!rendered.includes("/docs/guides/"));
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
  assert.deepEqual(await readdir(path.join(f.outputDir, "world-id-auth")), ["quickstart.mdx"]);
});

test("a missing approved source fails before any destination is written", async (t) => {
  const f = await fixture(t);
  await f.write(page.source, "# Guide\n\nExisting source.\n");
  const missing = { ...page, source: "missing.md", destination: "world-id-auth/missing.mdx" };
  await assert.rejects(() => syncGuides({ ...f, sourceCommit, config: { ...config, pages: [page, missing] } }));
  assert.deepEqual(await readdir(f.outputDir), []);
});
