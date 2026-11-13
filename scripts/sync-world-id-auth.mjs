#!/usr/bin/env node
// Read canonical Markdown only. Never execute code from the source repository.
import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, realpath, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { renderQuickstartLayout } from "./world-id-auth-quickstart.mjs";
import { renderClientAuthentication } from "./world-id-auth-client-auth.mjs";
import { renderOidcExamples } from "./world-id-auth-oidc.mjs";
import { renderOidcTroubleshooting } from "./world-id-auth-troubleshooting.mjs";
import { renderCredentialCards } from "./world-id-auth-credentials.mjs";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const manifestPath = new URL("../.mintlify/world-id-auth-pages.json", import.meta.url);
const lockPath = ".mintlify/world-id-auth-source.json";
const environmentNote = [
  "<Note>",
  "  Unless a section explicitly says Sandbox, examples use the production issuer",
  "  `https://auth.world.org`. For sandbox testing, use `https://sandbox.auth.world.org`",
  "  for discovery, portal registration, credentials, and all authentication endpoints.",
  "  Keep every part of an integration in the same environment. See",
  "  [Test your integration](/agent-pass/testing#test-in-the-sandbox).",
  "</Note>",
].join("\n");
const federationDiagram = [
  "```mermaid",
  "---",
  "config:",
  "    sequence:",
  "        useMaxWidth: false",
  "---",
  "sequenceDiagram",
  "    accTitle: Two code exchanges authorize your MCP client",
  "    accDescr: The auth server exchanges an upstream authorization code with World ID for an ID token. After identity validation, permission checks, and consent, the MCP client exchanges a different downstream code with that auth server for a resource-bound access token.",
  "",
  "    participant Issuer as World ID issuer",
  "    participant Auth as Your auth server",
  "    participant Client as MCP client",
  "    participant MCP as Your MCP server",
  "",
  "    Note over Issuer,Auth: Upstream OIDC code exchange",
  "    Issuer-->>Auth: Authorization code via browser callback",
  "    Auth->>Issuer: Exchange upstream code",
  "    Issuer-->>Auth: ID token",
  "    Auth->>Auth: Validate identity, permissions, and consent",
  "    Note over Auth,Client: Separate downstream OAuth code exchange",
  "    Auth-->>Client: Different code via browser callback",
  "    Client->>Auth: Exchange downstream code",
  "    Auth-->>Client: Resource-bound access token",
  "    Client->>MCP: MCP request + access token",
  "    MCP->>MCP: Validate token and permissions before tools",
  "```",
].join("\n");
const publicIntroduction = "Your agent can read this guide because you authenticated with World ID and approved\nits OAuth access. This guide contains general guidance, not private account data.";
const publicReplacement = "When you authenticate with World ID and approve an agent's OAuth access, the agent\ncan read the authenticated version of this guide through the user MCP server.\nThis public guide contains the same general guidance, not private account data.";
const agentGuideSections = [
  "agent-instructions",
  "developer-portal-permission",
  "register-an-application-with-your-agent",
  "configure-an-existing-application-with-your-agent",
  "publish-a-benefit-listing",
];
const hash = (value) => createHash("sha256").update(value).digest("hex");

function validateConfig(config) {
  if (config.repository !== "worldcoin/temporal-apps" || config.sourceDirectory !== "apps/idpapi/mcp/guides") {
    throw new Error("Only the canonical temporal-apps guide directory can be published");
  }
  if (config.issuer !== "https://auth.world.org" || !config.pages?.length) {
    throw new Error("A production issuer and explicit guide allowlist are required");
  }
  const sources = new Set();
  const destinations = new Set();
  for (const page of config.pages) {
    if (!/^[a-z0-9-]+\.md$/.test(page.source) || !/^agent-pass\/[a-z0-9-]+\.mdx$/.test(page.destination)) {
      throw new Error("Guide paths must stay within the approved source and destination directories");
    }
    const sourceSelection = `${page.source}#${page.section ?? ""}`;
    if (sources.has(sourceSelection) || destinations.has(page.destination) || !page.title || !page.description) {
      throw new Error("Each guide needs a unique source selection, destination, title, and description");
    }
    if ((page.source === "world-id-users.md") !== Boolean(page.publicUserGuide)) {
      throw new Error("The authenticated user guide requires its explicitly approved public adaptation");
    }
    for (const [flag, source, destination] of [
      ["quickstartLayout", "getting-started.md", "agent-pass/quickstart.mdx"],
      ["clientAuthenticationExamples", "app-registration.md", "agent-pass/app-registration.mdx"],
      ["oidcExamples", "oidc.md", "agent-pass/connect-your-backend.mdx"],
      ["credentialCards", "id-token.md", "agent-pass/id-tokens-and-identity.mdx"],
    ]) {
      if (page[flag] !== undefined && (typeof page[flag] !== "boolean" || page.source !== source || page.destination !== destination)) {
        throw new Error(`The ${flag} adaptation is limited to ${source}`);
      }
    }
    if (page.section !== undefined && (typeof page.section !== "string" || !page.section.trim() || typeof page.sectionEnd !== "string" || !page.sectionEnd.trim())) {
      throw new Error("A derived guide requires its exact section heading and next-section boundary");
    }
    if (page.introAliases !== undefined && (!Array.isArray(page.introAliases) || page.introAliases.some((alias) => !/^[a-z0-9-]+$/.test(alias)))) {
      throw new Error("Introduction aliases must be explicit heading IDs");
    }
    sources.add(sourceSelection);
    destinations.add(page.destination);
  }
  for (const page of config.pages.filter((page) => page.section)) {
    if (!config.pages.some((candidate) => candidate.source === page.source && !candidate.section)) {
      throw new Error("A derived guide must keep its complete canonical guide published");
    }
  }
}

function rewriteLinks(markdown, config) {
  const routes = new Map(config.pages.filter((page) => !page.section).map((page) => [page.source.replace(/\.md$/, ""), `/${page.destination.replace(/\.mdx$/, "")}`]));
  // Explicit sandbox guides must keep their environment-specific URLs.
  let result = markdown.replace(/(?:\{\{issuer\}\}|https:\/\/auth\.world\.org)\/docs\/guides\/([a-z0-9-]+)(\.md)?(?=\/?(?:[?#\s)`"'<>\]]|$))/g, (_, id, extension = "") => {
    if (!routes.has(id)) throw new Error(`Unmapped guide link: ${id}`);
    return `https://docs.world.org${routes.get(id)}${extension}`;
  });
  result = result.replace(/\]\((?:\.\/)?([a-z0-9-]+)\.md(#[^)\s]+)?\)/g, (_, id, fragment = "") => {
    if (!routes.has(id)) throw new Error(`Unmapped relative guide link: ${id}`);
    return `](${routes.get(id)}${fragment})`;
  });
  // Markdown links use local routes; plain URLs and agent prompts stay absolute.
  result = result.replace(/\]\(https:\/\/docs\.world\.org(\/agent-pass\/[^)\s]+)\)/g, "]($1)");
  result = result.replaceAll("{{issuer}}", config.issuer);
  if (/\{\{[^}\n]+\}\}/.test(result)) throw new Error("Unknown source placeholder requires an explicit publishing rule");
  return result;
}

function escapeProse(text) {
  return text.replace(/(`+)(.*?)\1|<((?:https?:\/\/|mailto:)[^>]+)>|[{}<>]/g, (match, ticks, _code, url) => {
    if (ticks) return match;
    if (url) return `[${url}](${url})`;
    return { "{": "&#123;", "}": "&#125;", "<": "&lt;", ">": "&gt;" }[match];
  });
}

function headingSlug(heading) {
  return heading.toLowerCase().replace(/[`*_]/g, "").replace(/[^\p{L}\p{N}\s-]/gu, "").trim().replace(/\s+/g, "-");
}

function selectSection(markdown, page, config) {
  if (!page.section) return markdown;
  const headings = [];
  let offset = 0;
  let fence;
  for (const line of markdown.split("\n")) {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fence) {
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = undefined;
    } else if (marker) {
      fence = marker[1];
    } else {
      const heading = line.match(/^(#{2,6}) (.+)$/);
      if (heading) headings.push({ level: heading[1].length, title: heading[2], offset });
    }
    offset += line.length + 1;
  }
  const matches = headings.filter((heading) => heading.level === 2 && heading.title === page.section);
  if (matches.length !== 1) throw new Error(`Missing or repeated derived guide section: ${page.source}#${page.section}`);
  const start = matches[0].offset;
  const next = headings.find((heading) => heading.level === 2 && heading.offset > start);
  if (next?.title !== page.sectionEnd) throw new Error(`Derived guide boundary changed: ${page.source}#${page.section}`);
  const selected = markdown.slice(start, next.offset);
  const localAnchors = new Set(headings.filter((heading) => heading.offset >= start && heading.offset < next.offset).map((heading) => headingSlug(heading.title)));
  const parent = config.pages.find((candidate) => candidate.source === page.source && !candidate.section);
  const parentRoute = `/${parent.destination.replace(/\.mdx$/, "")}`;
  return selected.replace(/\]\(#([a-z0-9-]+)\)/g, (link, anchor) => localAnchors.has(anchor) ? link : `](${parentRoute}#${anchor})`);
}

export function renderGuide(markdown, page, config) {
  validateConfig(config);
  let body = markdown.replace(/\r\n/g, "\n");
  if (!/^# [^\n]+\n/.test(body)) throw new Error(`Missing guide title: ${page.source}`);
  body = body.replace(/^# [^\n]+\n+/, "");
  body = selectSection(body, page, config);
  if (page.publicUserGuide) {
    if (!body.startsWith(publicIntroduction)) throw new Error("The authenticated user introduction changed; review its public adaptation");
    body = publicReplacement + body.slice(publicIntroduction.length);
  }
  body = rewriteLinks(body, config);
  const ids = new Map();
  const sections = [];
  let fence;
  const lines = body.split("\n").map((line, index) => {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fence) {
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = undefined;
      return line;
    }
    if (marker) {
      fence = marker[1];
      return line.replace(/(`{3,}|~{3,})prompt\s*$/, "$1text");
    }
    const heading = line.match(/^(#{2,6}) (.+?)(?: \{#([a-z0-9-]+)\})?$/);
    if (!heading) return escapeProse(line);
    const base = heading[3] ?? headingSlug(heading[2]);
    const count = ids.get(base) ?? 0;
    ids.set(base, count + 1);
    const id = count ? `${base}-${count}` : base;
    if (heading[1] === "##") sections.push({ id, index });
    const aliases = (page.anchorAliases?.[id] ?? []).filter((alias) => alias !== id).map((alias) => {
      if (!/^[a-z0-9-]+$/.test(alias)) throw new Error(`Invalid heading alias: ${alias}`);
      return `<span id="${alias}" />\n\n`;
    }).join("");
    return `${aliases}${heading[1]} ${escapeProse(heading[2])} {#${id}}`;
  });
  if (fence) throw new Error(`Unclosed code fence: ${page.source}`);
  for (const id of Object.keys(page.anchorAliases ?? {})) {
    if (!ids.has(id)) throw new Error(`Missing heading for legacy anchor aliases: ${page.source}#${id}`);
  }
  if (page.source === "coding-agent-setup.md") {
    for (const id of agentGuideSections) {
      const matches = sections.filter((section) => section.id === id);
      const section = matches[0];
      const end = section && (sections[sections.indexOf(section) + 1]?.index ?? lines.length);
      if (matches.length !== 1 || ids.get(id) !== 1 || !lines.slice(section.index + 1, end).some((line) => line.trim() && !/^ {0,3}(`{3,}|~{3,})/.test(line))) {
        throw new Error(`Incomplete coding-agent guide: preserve the full ${id} section and later instructions`);
      }
    }
  }
  let content = lines.join("\n").trimEnd();
  if (page.federationDiagram) {
    const image = /^!\[[^\n]*\]\(https:\/\/auth\.world\.org\/portal\/assets\/mcp-authorization\.svg\)$/m;
    if (!image.test(content)) throw new Error("The federation illustration changed; review its Mermaid adaptation");
    content = content.replace(image, federationDiagram);
  }
  if (page.quickstartLayout) content = renderQuickstartLayout(content);
  if (page.clientAuthenticationExamples) content = renderClientAuthentication(content);
  if (page.oidcExamples) {
    content = renderOidcExamples(content);
    content = renderOidcTroubleshooting(content);
  }
  if (page.credentialCards) content = renderCredentialCards(content);
  for (const alias of [...(page.introAliases ?? [])].reverse()) {
    if (ids.has(alias)) continue;
    content = `<span id="${alias}" />\n\n${content}`;
  }
  const metadata = [
    "---",
    `title: ${JSON.stringify(page.title)}`,
    `sidebarTitle: ${JSON.stringify(page.sidebarTitle ?? page.title)}`,
    ...(page.icon ? [`icon: ${JSON.stringify(page.icon)}`] : []),
    `description: ${JSON.stringify(page.description)}`,
    '"og:image": "https://raw.githubusercontent.com/worldcoin/developer-docs/main/images/docs/docs-meta.png"',
    '"twitter:image": "https://raw.githubusercontent.com/worldcoin/developer-docs/main/images/docs/docs-meta.png"',
    "---",
    "",
    `{/* Generated from ${config.repository}/${config.sourceDirectory}/${page.source}. Edit the source Markdown, then run scripts/sync-world-id-auth.mjs. */}`,
    "",
  ];
  if (page.environmentNote) metadata.push(environmentNote, "");
  return `${metadata.join("\n")}\n${content}\n`;
}

async function readOptional(filename) {
  try { return await readFile(filename, "utf8"); }
  catch (error) { if (error.code === "ENOENT") return null; throw error; }
}

async function readSource(sourceDir, relativePath) {
  const filename = path.resolve(sourceDir, relativePath);
  const resolved = await realpath(filename);
  if (!resolved.startsWith(`${await realpath(sourceDir)}${path.sep}`) || !(await lstat(filename)).isFile()) {
    throw new Error(`Source must be a regular file inside temporal-apps: ${relativePath}`);
  }
  return readFile(filename, "utf8");
}

export async function syncGuides({ sourceDir, sourceCommit, outputDir = repositoryRoot, check = false, config }) {
  if (!/^[a-f0-9]{40}$/.test(sourceCommit ?? "")) throw new Error("Provide the full source commit SHA with --source-commit");
  config ??= JSON.parse(await readFile(manifestPath, "utf8"));
  validateConfig(config);
  const outputs = new Map();
  const sources = {};
  // Finish all reads and rendering before writing any generated file.
  for (const page of config.pages) {
    const source = `${config.sourceDirectory}/${page.source}`;
    const markdown = await readSource(sourceDir, source);
    sources[source] = hash(markdown);
    outputs.set(page.destination, renderGuide(markdown, page, config));
  }
  const previousText = await readOptional(path.join(outputDir, lockPath));
  const previous = previousText ? JSON.parse(previousText) : null;
  const provenance = {
    repository: config.repository,
    sourceDirectory: config.sourceDirectory,
    configSha256: hash(JSON.stringify(config)),
    sources,
    outputs: Object.fromEntries([...outputs].map(([filename, content]) => [filename, hash(content)])),
  };
  const { sourceCommit: previousCommit, ...previousInputs } = previous ?? {};
  const sameInputs = JSON.stringify(previousInputs) === JSON.stringify(provenance);
  const recordedCommit = sameInputs ? previousCommit : sourceCommit;
  outputs.set(lockPath, `${JSON.stringify({ ...provenance, sourceCommit: recordedCommit }, null, 2)}\n`);
  const changed = [];
  for (const [filename, content] of outputs) {
    if (await readOptional(path.join(outputDir, filename)) !== content) changed.push(filename);
  }
  if (!check) {
    for (const filename of changed) {
      const destination = path.join(outputDir, filename);
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, outputs.get(filename));
    }
  }
  return { changed, sourceCommit: recordedCommit };
}

async function main() {
  const args = process.argv.slice(2);
  const options = {};
  for (let index = 0; index < args.length; index++) {
    const argument = args[index];
    if (argument === "--check") options.check = true;
    else if (["--source-dir", "--source-commit", "--output-dir"].includes(argument) && args[index + 1] && !args[index + 1].startsWith("--")) {
      const key = { "--source-dir": "sourceDir", "--source-commit": "sourceCommit", "--output-dir": "outputDir" }[argument];
      options[key] = path.resolve(args[++index]);
      if (key === "sourceCommit") options[key] = args[index];
    } else throw new Error(`Unknown or incomplete argument: ${argument}`);
  }
  if (!options.sourceDir) throw new Error("Usage: node scripts/sync-world-id-auth.mjs --source-dir <temporal-apps checkout> --source-commit <SHA> [--check]");
  const result = await syncGuides(options);
  if (options.check && result.changed.length) throw new Error(`Generated IDP files are out of date:\n${result.changed.join("\n")}`);
  console.log(result.changed.length ? `Updated ${result.changed.length} IDP files from ${result.sourceCommit}` : "IDP files match the canonical Markdown");
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
