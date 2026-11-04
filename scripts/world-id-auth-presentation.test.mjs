import assert from "node:assert/strict";
import test from "node:test";

import { deriveGuides, presentGuide } from "./world-id-auth-presentation.mjs";

const browserPage = {
  source: "oidc.md",
  destination: "world-id-auth/connect-your-backend.mdx",
  title: "Connect your backend",
  description: "Connect with OIDC.",
  presentation: "browser",
};
const agentPage = {
  source: "coding-agent-setup.md",
  destination: "world-id-auth/build-with-a-coding-agent.mdx",
  title: "Build with a coding agent",
  description: "Connect developer tools.",
  presentation: "agent-setup",
};

const deviceBody = [
  "Keep client credentials and the device code outside model messages.",
  "",
  "### Supported device profile",
  "",
  "Device tokens omit nonce. Validate issuer, audience, signature, and expiry.",
  "",
  "### Device flow",
  "",
  "Wait the returned interval. A slow_down response increases the interval.",
  "",
  "```text",
  "grant_type=urn:ietf:params:oauth:grant-type:device_code",
  "device_code=<private-device-code>",
  "```",
  "",
  "### Expiry and rate limits",
  "",
  "Stop when the attempt expires. Never treat an error as approval.",
].join("\n");

const browserMarkdown = [
  "# Connect your backend",
  "",
  "Keep your existing application sign-in.",
  "",
  "## Configure your OIDC library",
  "",
  "Use discovery and credentials from the same environment.",
  "",
  "## Authenticate through the browser",
  "",
  "Bind state, nonce, and PKCE to the browser attempt.",
  "",
  "## Validate the ID token",
  "",
  "Validate before trusting the returned claims.",
  "",
  "## Client authentication",
  "",
  "Use the registered client authentication method.",
  "",
  "## Connect a headless agent (device flow)",
  "",
  deviceBody,
  "",
  "## Cross-App Access for agent hosts",
  "",
  "XAA requires explicit delegation consent.",
  "",
  "## Recovery after interrupted requests",
  "",
  "Reconcile an uncertain result before retrying.",
  "",
  "## Primary sign-in",
  "",
  "Issue your own application session after validation.",
].join("\n");

const agentMarkdown = [
  "# Set up your coding agent",
  "",
  "## Give your coding agent the guide",
  "",
  "Read the public guides without authorizing developer access.",
  "",
  "## Connect your coding agent",
  "",
  "### Codex CLI",
  "",
  "```sh",
  "codex mcp list",
  "```",
  "",
  "### Claude Code",
  "",
  "```sh",
  "claude mcp list",
  "```",
  "",
  "### Check the connection",
  "",
  "Check that the current chat can list the guides.",
  "",
  "## Agent instructions",
  "",
  "Never expose client secrets to model messages.",
  "",
  "## Developer-portal permission",
  "",
  "Request only developer-portal:manage on /mcp/developer.",
  "",
  "## Register an application with your agent",
  "",
  "Reuse requestId on retries and wait for the user's portal approval.",
  "",
  "## Configure an existing application with your agent",
  "",
  "Do not replace unrelated configuration.",
  "",
  "## Publish a benefit listing",
  "",
  "A successful registration does not mean the listing is published.",
  "",
].join("\n");

function renderedBody(markdown) {
  return markdown.replace(/^# [^\n]+\n\n/, "").replace(/^(#{2,6}) (.+)$/gm, (_, marks, heading) => {
    const anchor = heading.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s+/g, "-");
    return `${marks} ${heading} {#${anchor}}`;
  });
}

function assertAnchor(content, anchor) {
  assert.ok(content.includes(`{#${anchor}}`) || content.includes(`id="${anchor}"`), `Missing existing anchor: ${anchor}`);
}

test("guides without a presentation preset keep the legacy body and produce no derived pages", () => {
  const content = "## Existing section {#existing-section}\n\nKeep `{literal}` unchanged.\n";
  for (const presentation of [undefined, false]) {
    const page = { ...browserPage, presentation };
    assert.deepEqual(presentGuide(content, page), { content, imports: [] });
    assert.deepEqual(deriveGuides(browserMarkdown, page), []);
  }
});

test("the registration view adds portal screenshots beside their instructions and keeps the original text", () => {
  const original = "Sign in to the developer portal.\n\nCheck that your Google account is eligible in the target environment.\n\n## Register your application {#register-your-application}\n\nUse exact HTTPS callbacks and keep credentials in your backend.\n\nWorld ID authentication with `openid` requires a client registered through the portal.\n\n## Manage credentials and callbacks {#manage-credentials-and-callbacks}\n\nSave new secrets directly in backend configuration.\n\nWhen migrating to a new sector, retain the old account mapping during the transition.\n";
  const { content, imports } = presentGuide(original, { presentation: "registration" });
  assert.ok(imports.includes('import AuthPortalSignIn from "/snippets/world-id-auth/portal-sign-in.mdx";'));
  assert.ok(imports.includes('import AuthPortalRegistration from "/snippets/world-id-auth/portal-registration.mdx";'));
  assert.ok(imports.includes('import AuthApplicationSettings from "/snippets/world-id-auth/application-settings.mdx";'));
  assert.ok(content.indexOf("<AuthPortalSignIn />") < content.indexOf("<AuthRegistrationChecklist />"));
  assert.ok(content.indexOf("<AuthRegistrationChecklist />") < content.indexOf("## Register your application"));
  assert.ok(content.includes("<AuthPortalSignIn />\n\nCheck that your Google account is eligible"));
  assert.ok(content.includes("Use exact HTTPS callbacks and keep credentials in your backend.\n\n<AuthPortalRegistration />"));
  assert.ok(content.includes("Save new secrets directly in backend configuration.\n\n<AuthApplicationSettings />"));
  let withoutSnippets = content;
  for (const name of ["AuthPortalSignIn", "AuthRegistrationChecklist", "AuthPortalRegistration", "AuthApplicationSettings"]) {
    withoutSnippets = withoutSnippets.replace(`<${name} />\n\n`, "");
  }
  assert.equal(withoutSnippets, original);
});

test("the derived device guide preserves the entire device contract and code", () => {
  const derived = deriveGuides(browserMarkdown, browserPage);
  assert.equal(derived.length, 1);
  assert.equal(derived[0].page.destination, "world-id-auth/device-flow.mdx");
  assert.equal(derived[0].page.presentation, "device");
  assert.ok(derived[0].markdown.includes(deviceBody));
  assert.ok(!derived[0].markdown.includes("XAA requires explicit delegation consent."));
});

test("the browser view points old device anchors to the derived guide without removing adjacent guidance", () => {
  const original = renderedBody(browserMarkdown).replace("## Connect a headless agent", '<span id="sign-in-a-headless-agent-device-flow" />\n\n## Connect a headless agent');
  const { content, imports } = presentGuide(original, browserPage);
  assert.ok(content.includes("Bind state, nonce, and PKCE to the browser attempt."));
  assert.ok(content.includes("Validate before trusting the returned claims."));
  assert.ok(content.includes("XAA requires explicit delegation consent."));
  assert.ok(content.includes("Reconcile an uncertain result before retrying."));
  assert.ok(!content.includes("device_code=<private-device-code>"));
  assert.ok(content.includes("/world-id-auth/device-flow"));
  for (const anchor of ["sign-in-a-headless-agent-device-flow", "connect-a-headless-agent-device-flow", "supported-device-profile", "device-flow", "expiry-and-rate-limits"]) {
    assertAnchor(content, anchor);
  }
  assert.ok(content.indexOf("Issue your own application session after validation.") < content.indexOf("## Client authentication"));
  assert.ok(imports.some((value) => value.includes("/snippets/world-id-auth/browser-flow.mdx")));
  assert.ok(imports.some((value) => value.includes("/snippets/world-id-auth/browser-example.mdx")));
});

test("the agent reference retains the complete original instructions without rewriting its source", () => {
  const derived = deriveGuides(agentMarkdown, agentPage);
  assert.equal(derived.length, 1);
  assert.equal(derived[0].page.destination, "world-id-auth/coding-agent-reference.mdx");
  assert.equal(derived[0].page.presentation, "agent-reference");
  assert.equal(derived[0].markdown, agentMarkdown);
});

test("the human agent setup view retains connection steps and useful links at all old instruction anchors", () => {
  const { content, imports } = presentGuide(renderedBody(agentMarkdown), agentPage);
  assert.ok(content.includes("Read the public guides without authorizing developer access."));
  assert.ok(content.includes("Check that the current chat can list the guides."));
  assert.ok(!content.includes("Reuse requestId on retries"));
  assert.ok(content.includes("/world-id-auth/coding-agent-reference"));
  for (const anchor of ["agent-instructions", "developer-portal-permission", "register-an-application-with-your-agent", "configure-an-existing-application-with-your-agent", "publish-a-benefit-listing"]) {
    assertAnchor(content, anchor);
  }
  assert.ok(content.includes("codex mcp list"));
  assert.ok(content.includes("claude mcp list"));
  assert.ok(content.indexOf("Check that the current chat can list the guides.") > content.indexOf("</Tabs>"));
  assert.ok(imports.some((value) => value.includes("/snippets/world-id-auth/agent-connection-checks.mdx")));
  assert.ok(imports.includes('import AuthDeveloperConnections from "/snippets/world-id-auth/developer-connections.mdx";'));
  assert.ok(content.indexOf("<AuthDeveloperConnections />") > content.indexOf("Check that the current chat can list the guides."));
  assert.ok(content.includes("<AuthDeveloperConnections />\n\n## Complete instructions for agents"));
});

test("the complete agent reference has no human-view truncation", () => {
  const content = renderedBody(agentMarkdown);
  assert.deepEqual(presentGuide(content, { ...agentPage, presentation: "agent-reference" }), { content, imports: [] });
});

test("changed device boundaries fail instead of silently dropping instructions", () => {
  for (const markdown of [
    browserMarkdown.replace("## Connect a headless agent (device flow)", "## New device heading"),
    browserMarkdown.replace("## Cross-App Access for agent hosts", "## New delegation heading"),
  ]) {
    assert.throws(() => deriveGuides(markdown, browserPage), /device|headless|section|boundar/i);
    assert.throws(() => presentGuide(renderedBody(markdown), browserPage), /device|headless|section|boundar/i);
  }
});

test("a changed agent instructions boundary fails before creating an incomplete reference", () => {
  const markdown = agentMarkdown.replace("## Agent instructions", "## New instructions heading");
  assert.throws(() => deriveGuides(markdown, agentPage), /agent|section|boundar/i);
  assert.throws(() => presentGuide(renderedBody(markdown), agentPage), /agent|section|boundar/i);
});
