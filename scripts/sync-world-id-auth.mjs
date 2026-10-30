#!/usr/bin/env node
// Read canonical Markdown only. Never execute code from the source repository.
import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, realpath, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const manifestPath = new URL("../.mintlify/world-id-auth-pages.json", import.meta.url);
const lockPath = ".mintlify/world-id-auth-source.json";
const publicIntroduction = "Your agent can read this guide because you authenticated with World ID and approved\nits OAuth access. This guide contains general guidance, not private account data.";
const publicReplacement = "When you authenticate with World ID and approve an agent's OAuth access, the agent\ncan read the authenticated version of this guide through the user MCP server.\nThis public guide contains the same general guidance, not private account data.";
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
    if (!/^[a-z0-9-]+\.md$/.test(page.source) || !/^world-id-auth\/[a-z0-9-]+\.mdx$/.test(page.destination)) {
      throw new Error("Guide paths must stay within the approved source and destination directories");
    }
    if (sources.has(page.source) || destinations.has(page.destination) || !page.title || !page.description) {
      throw new Error("Each guide needs a unique source, destination, title, and description");
    }
    if ((page.source === "world-id-users.md") !== Boolean(page.publicUserGuide)) {
      throw new Error("The authenticated user guide requires its explicitly approved public adaptation");
    }
    sources.add(page.source);
    destinations.add(page.destination);
  }
  for (const asset of config.assets ?? []) {
    if (asset.source !== "apps/idpportal/public/assets/mcp-federation.svg" || asset.destination !== "images/world-id-auth/mcp-federation.svg") {
      throw new Error("Only the explicitly approved federation diagram can be copied");
    }
  }
}

function rewriteLinks(markdown, config) {
  const routes = new Map(config.pages.map((page) => [page.source.replace(/\.md$/, ""), `/${page.destination.replace(/\.mdx$/, "")}`]));
  let result = markdown.replace(/(?:\{\{issuer\}\}|https:\/\/(?:sandbox\.)?auth\.world\.org)\/docs\/guides\/([a-z0-9-]+)(\.md)?/g, (_, id, extension = "") => {
    if (!routes.has(id)) throw new Error(`Unmapped guide link: ${id}`);
    return `https://docs.world.org${routes.get(id)}${extension}`;
  });
  result = result.replace(/\]\((?:\.\/)?([a-z0-9-]+)\.md(#[^)\s]+)?\)/g, (_, id, fragment = "") => {
    if (!routes.has(id)) throw new Error(`Unmapped relative guide link: ${id}`);
    return `](${routes.get(id)}${fragment})`;
  });
  // Markdown links use local routes; plain URLs and agent prompts stay absolute.
  result = result.replace(/\]\(https:\/\/docs\.world\.org(\/world-id-auth\/[^)\s]+)\)/g, "]($1)");
  for (const asset of config.assets ?? []) result = result.replaceAll(asset.url, `/${asset.destination}`);
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

export function renderGuide(markdown, page, config) {
  validateConfig(config);
  let body = markdown.replace(/\r\n/g, "\n");
  if (!/^# [^\n]+\n/.test(body)) throw new Error(`Missing guide title: ${page.source}`);
  body = body.replace(/^# [^\n]+\n+/, "");
  if (page.publicUserGuide) {
    if (!body.startsWith(publicIntroduction)) throw new Error("The authenticated user introduction changed; review its public adaptation");
    body = publicReplacement + body.slice(publicIntroduction.length);
  }
  body = rewriteLinks(body, config);
  const ids = new Map();
  let fence;
  const lines = body.split("\n").map((line) => {
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
    const aliases = (page.anchorAliases?.[id] ?? []).map((alias) => {
      if (!/^[a-z0-9-]+$/.test(alias)) throw new Error(`Invalid heading alias: ${alias}`);
      return `<span id="${alias}" />\n\n`;
    }).join("");
    return `${aliases}${heading[1]} ${escapeProse(heading[2])} {#${id}}`;
  });
  if (fence) throw new Error(`Unclosed code fence: ${page.source}`);
  const metadata = [
    "---",
    `title: ${JSON.stringify(page.title)}`,
    `sidebarTitle: ${JSON.stringify(page.sidebarTitle ?? page.title)}`,
    `description: ${JSON.stringify(page.description)}`,
    '"og:image": "https://raw.githubusercontent.com/worldcoin/developer-docs/main/images/docs/docs-meta.png"',
    '"twitter:image": "https://raw.githubusercontent.com/worldcoin/developer-docs/main/images/docs/docs-meta.png"',
    "---",
    "",
    `{/* Generated from ${config.repository}/${config.sourceDirectory}/${page.source}. Edit the source Markdown, then run scripts/sync-world-id-auth.mjs. */}`,
    "",
  ];
  if (page.environmentNote) metadata.push('import AuthEnvironment from "/snippets/world-id-auth-environment.mdx";', "", "<AuthEnvironment />", "");
  return `${metadata.join("\n")}\n${lines.join("\n").trimEnd()}\n`;
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
  for (const asset of config.assets ?? []) {
    const svg = await readSource(sourceDir, asset.source);
    sources[asset.source] = hash(svg);
    outputs.set(asset.destination, svg);
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
