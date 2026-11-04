// Approved human-reading adaptations. Canonical Markdown stays in temporal-apps.
const deviceHeading = "## Connect a headless agent (device flow)";
const agentHeading = "## Agent instructions";
const devicePath = "world-id-auth/device-flow.mdx";
const agentPath = "world-id-auth/coding-agent-reference.mdx";

function section(content, heading) {
  const start = content.indexOf(`${heading} `) >= 0
    ? content.indexOf(`${heading} `)
    : content.indexOf(`${heading}\n`);
  if (start < 0 || (start > 0 && content[start - 1] !== "\n")) {
    throw new Error(`Reading adaptation requires the source section: ${heading}`);
  }
  const end = content.indexOf("\n## ", start + heading.length);
  return { start, end: end < 0 ? content.length : end, text: content.slice(start, end < 0 ? content.length : end) };
}

function replaceSection(content, heading, transform) {
  const found = section(content, heading);
  return content.slice(0, found.start) + transform(found.text) + content.slice(found.end);
}

function deviceSection(content) {
  const found = section(content, deviceHeading);
  if (!content.slice(found.end).startsWith("\n## Cross-App Access for agent hosts")) {
    throw new Error("Device guide boundary changed; review the Cross-App Access section before publishing");
  }
  return found;
}

function headingLinks(content, destination) {
  return [...content.matchAll(/^#{2,6} (.+?) \{#([a-z0-9-]+)\}$/gm)]
    .map(([, title, id]) => `<span id="${id}" />\n\n[${title}](/${destination}#${id})`).join("\n\n");
}

export function deriveGuides(markdown, page) {
  if (page.presentation === "browser") {
    const found = deviceSection(markdown);
    const body = found.text.slice(found.text.indexOf("\n") + 1).trim();
    return [{
      page: { ...page, destination: devicePath, title: "Connect an agent or CLI", sidebarTitle: "Agent or CLI", description: "Authenticate a headless agent through a confidential backend using the device flow.", presentation: "device", icon: undefined },
      markdown: `# Connect an agent or CLI\n\n[Register your application]({{issuer}}/docs/guides/app-registration) first. Keep the matching issuer, credentials and client-authentication method in your backend.\n\n${body}\n`,
    }];
  }
  if (page.presentation === "agent-setup") {
    section(markdown, agentHeading);
    return [{
      page: { ...page, destination: agentPath, title: "Coding agent reference", sidebarTitle: "Coding agent reference", description: "Complete integration and developer-tool instructions for coding agents.", presentation: "agent-reference", icon: undefined },
      markdown,
    }];
  }
  return [];
}

export function presentGuide(original, page) {
  let content = original;
  const imports = [];
  const use = (name, filename) => {
    imports.push(`import ${name} from "/snippets/world-id-auth/${filename}.mdx";`);
    return `<${name} />`;
  };
  const before = (heading, addition) => {
    const found = section(content, heading);
    content = content.slice(0, found.start) + addition + "\n\n" + content.slice(found.start);
  };
  const afterHeading = (heading, addition) => {
    content = replaceSection(content, heading, (block) => block.replace(/\n/, `\n\n${addition}\n`));
  };
  const beforeText = (marker, addition) => {
    const start = content.indexOf(marker);
    if (start < 0) throw new Error(`Screenshot placement requires the source text: ${marker}`);
    content = content.slice(0, start) + addition + "\n\n" + content.slice(start);
  };
  switch (page.presentation) {
    case "overview": {
      const cards = use("AuthIntegrationPaths", "integration-paths");
      content = replaceSection(content, "## Integrate in four steps", (block) => {
        const firstLine = block.slice(0, block.indexOf("\n"));
        return `${firstLine.replace("Integrate in four steps", "Choose your integration")}\n\n[Register your application](/world-id-auth/app-registration) before connecting it.\n\n${cards}\n\n[Test the complete integration](/world-id-auth/testing), including the protected action your application uses.\n`;
      });
      content = `<Note>For sandbox testing, request access to the sandbox World ID app before starting. Test identity issuance can take about one hour. [Set up the sandbox](/world-id-auth/testing#test-in-the-sandbox).</Note>\n\n${content}`;
      break;
    }
    case "registration":
      beforeText("Check that your Google account is eligible", use("AuthPortalSignIn", "portal-sign-in"));
      before("## Register your application", use("AuthRegistrationChecklist", "registration-checklist"));
      beforeText("World ID authentication with `openid` requires a client registered through the portal.", use("AuthPortalRegistration", "portal-registration"));
      beforeText("When migrating to a new sector, retain the old account mapping during the transition.", use("AuthApplicationSettings", "application-settings"));
      break;
    case "browser": {
      const found = deviceSection(content);
      const firstLine = found.text.slice(0, found.text.indexOf("\n"));
      content = content.slice(0, found.start) + `${firstLine}\n\nFollow [Connect an agent or CLI](/world-id-auth/device-flow) for the supported device profile, polling, expiry, and stop rules.\n\n${headingLinks(found.text.slice(firstLine.length + 1), "world-id-auth/device-flow")}\n` + content.slice(found.end);
      before("## Configure your OIDC library", use("AuthBrowserFlow", "browser-flow"));
      before("## Client authentication", `## Worked browser example {#worked-browser-example}\n\n${use("AuthBrowserExample", "browser-example")}`);
      // Put the application result before the alternate flows and reference material.
      const primary = section(content, "## Primary sign-in");
      content = content.slice(0, primary.start) + content.slice(primary.end);
      before("## Client authentication", primary.text.trim());
      break;
    }
    case "device":
      before("### Device flow", use("AuthDeviceFlow", "device-flow"));
      content = content.replaceAll("/world-id-auth/connect-your-backend#supported-device-profile", "/world-id-auth/device-flow#supported-device-profile")
        .replaceAll("/world-id-auth/connect-your-backend#device-flow", "/world-id-auth/device-flow#device-flow");
      break;
    case "federation": {
      const image = /^!\[[^\n]*\]\(\/images\/world-id-auth\/mcp-federation\.svg\)$/m;
      if (!image.test(content)) throw new Error("Federation illustration changed; review the presentation adaptation");
      imports.push('import AuthFederationDiagram from "/snippets/world-id-auth-federation.mdx";');
      content = content.replace(image, "<AuthFederationDiagram />");
      break;
    }
    case "identity":
      before("## Claim reference", `## Authentication time and token time {#freshness-example}\n\n${use("AuthFreshness", "freshness")}`);
      break;
    case "step-up":
      content = content.replace("fields request a supported class and a new proof:", "fields request a preferred class and fresh authentication:")
        .replace("must cause a\nfresh upstream proof", "must cause a\nfresh upstream authentication");
      before("## Request parameters", "See [Authentication time and token time](/world-id-auth/id-tokens-and-identity#freshness-example) for an example of enforcing an authentication-age policy. A new token does not by itself refresh authentication.");
      break;
    case "hitl":
      content = content.replace("require a new World proof for each attempt", "require fresh authentication for each attempt");
      afterHeading("## Optional: collect action approval in your application", use("AuthHumanCheckpoint", "human-checkpoint"));
      break;
    case "xaa":
      before("## Configure your authorization server", use("AuthXaaFlow", "xaa-flow"));
      break;
    case "user":
      content = replaceSection(content, "## Manage your connection", (block) => `${block.slice(0, block.indexOf("\n"))}\n\nAccess tokens last at most one hour. Successful refreshes renew the connection's 180-day inactivity deadline.\n\n${use("AuthUserConnections", "user-connections")}\n\nDevelopers can [start an integration](/world-id-auth/quickstart) or [connect coding tools](/world-id-auth/build-with-a-coding-agent).\n`);
      break;
    case "agent-setup": {
      const found = section(content, agentHeading);
      const fullInstructions = content.slice(found.start);
      content = `${content.slice(0, found.start).trimEnd()}\n\n## Complete instructions for agents {#agent-instructions}\n\nRead the [complete coding agent reference](/world-id-auth/coding-agent-reference) for tool permissions, approvals, registration and credential management. Its [Markdown version](/world-id-auth/coding-agent-reference.md) retains the complete instructions for coding agents.\n\n${headingLinks(fullInstructions, "world-id-auth/coding-agent-reference").replace(/^<span id="agent-instructions" \/>\n\n/, "")}\n`;
      const codex = section(content, "### Codex CLI");
      const claude = section(content, "### Claude Code");
      const check = section(content, "### Check the connection");
      const codexBody = content.slice(codex.start, claude.start).trim();
      const claudeBody = content.slice(claude.start, check.start).trim();
      content = content.slice(0, codex.start) + `<Tabs>\n  <Tab title="Codex">\n\n${codexBody}\n\n  </Tab>\n  <Tab title="Claude Code">\n\n${claudeBody}\n\n  </Tab>\n</Tabs>\n\n` + content.slice(check.start);
      before("### Check the connection", use("AuthAgentConnectionChecks", "agent-connection-checks"));
      before("## Complete instructions for agents", use("AuthDeveloperConnections", "developer-connections"));
      break;
    }
    case "testing":
      before("## Complete a real flow", `## Evidence checklist {#evidence-checklist}\n\n${use("AuthTestingChecklist", "testing-checklist")}`);
      break;
    case "agent-reference":
    case undefined:
    case false:
      break;
    default:
      throw new Error(`Unknown IDP presentation: ${page.presentation}`);
  }
  return { content, imports };
}
