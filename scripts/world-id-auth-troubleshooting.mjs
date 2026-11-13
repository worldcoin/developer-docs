// Reviewed human presentation; retain the complete canonical section for agents.
import { createHash } from "node:crypto";

const heading = "## Troubleshooting {#troubleshooting}";
// Pin the entire rendered canonical section, including its introduction and rows.
// Horizontal table padding and trailing whitespace do not affect the contract.
const expectedSectionSha256 = "7c8fae10d35e79a48e81f3ce69e43e5ca197a19635d2ad76184ae1859c1d4263";
const tabTitles = [
  "invalid_scope",
  "unsupported_grant_type",
  "invalid_request",
  "invalid_client",
  "invalid_grant",
  "Silent sign-in",
  "Portal access",
  "HTTP 503",
];
const introduction = [
  "Select an error to see what to check. OAuth failures provide `error` and",
  "`error_description` in a JSON response or authorization error redirect.",
  "Use `error` to choose how your application responds and `error_description`",
  "to diagnose malformed parameters.",
].join("\n");
const commonGuidance = [
  "<Note>",
  "  Descriptions never echo submitted values. Credential, grant, and service",
  "  errors use generic descriptions. Keep dependency failures distinguishable",
  "  from invalid authentication.",
  "</Note>",
].join("\n");

export function renderOidcTroubleshooting(content) {
  const matches = [...content.matchAll(/^## Troubleshooting \{#troubleshooting\}$/gm)];
  if (matches.length !== 1) {
    throw new Error("OIDC troubleshooting requires exactly one canonical section");
  }
  const start = matches[0].index;
  const original = content.slice(start);
  const normalized = original.replace(/[ \t]+/g, " ").trim();
  if (createHash("sha256").update(normalized).digest("hex") !== expectedSectionSha256) {
    throw new Error("Canonical OIDC troubleshooting changed; review its error tabs");
  }
  const rows = original.split("\n").filter((line) => line.startsWith("| "))
    .slice(2).map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()));
  if (rows.length !== tabTitles.length || rows.some((row) => row.length !== 2)) {
    throw new Error("OIDC troubleshooting table changed; review its error tabs");
  }
  const tabs = rows.map(([symptom, check], index) => {
    const mismatchGuidance = index === 2
      ? "\n\nClient and callback mismatches use the same guidance."
      : "";
    return `  <Tab title="${tabTitles[index]}">\n\n${symptom}\n\n${check}${mismatchGuidance}\n\n  </Tab>`;
  }).join("\n");
  const agentBody = original.slice(heading.length).trim();
  return content.slice(0, start) + [
    heading, "",
    '<Visibility for="humans">', "",
    introduction, "", commonGuidance, "", "<Tabs>", tabs, "</Tabs>", "",
    "</Visibility>", "",
    '<Visibility for="agents">', "", agentBody, "", "</Visibility>",
  ].join("\n");
}
