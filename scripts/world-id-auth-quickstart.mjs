// Presentation-only adaptations. Keep the complete canonical text in agent exports.
const icons = {
  "/agent-pass/connect-your-backend#sign-in-through-the-browser": "window-maximize",
  "/agent-pass/connect-your-backend#sign-in-a-headless-agent-device-flow": "terminal",
  "/agent-pass/step-up": "shield-halved",
  "/agent-pass/step-up#human-checkpoints": "user-check",
  "/agent-pass/connect-your-backend#primary-sign-in": "key",
  "/agent-pass/connect-your-auth-server": "server",
  "/agent-pass/xaa": "arrows-left-right",
};
const heading = (title, id) => `## ${title} {#${id}}\n`;
const visibility = (human, original) => `<Visibility for="humans">\n${human}\n</Visibility>\n\n<Visibility for="agents">\n${original}\n</Visibility>`;
const attribute = (value) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");

function review(message) {
  throw new Error(`Quickstart layout requires review: ${message}`);
}

function section(content, title, id, nextTitle, nextId, render) {
  const startHeading = heading(title, id);
  const endHeading = heading(nextTitle, nextId);
  if (content.split(startHeading).length !== 2 || content.split(endHeading).length !== 2) {
    review(`missing or repeated section boundary for ${title}`);
  }
  const start = content.indexOf(startHeading) + startHeading.length;
  const end = content.indexOf(endHeading, start);
  if (end < start || /^## /m.test(content.slice(start, end))) review(`section boundary changed for ${title}`);
  return content.slice(0, start) + render(content.slice(start, end)) + content.slice(end);
}

function table(body, columns, rowCount) {
  const matches = [...body.matchAll(/^\|[^\n]*\|[ \t]*(?:\n\|[^\n]*\|[ \t]*)+$/gm)];
  if (matches.length !== 1) review(`expected one ${columns.join("/")} table`);
  const original = matches[0][0];
  const rows = original.split("\n").map((line) => line.trim().slice(1, -1).split("|").map((cell) => cell.trim()));
  if (rows.some((row) => row.length !== columns.length) || rows[0].join("|") !== columns.join("|") ||
      !rows[1]?.every((cell) => /^:?-{3,}:?$/.test(cell)) || rows.length !== rowCount + 2) {
    review(`changed ${columns.join("/")} table columns or row count`);
  }
  return { original, rows: rows.slice(2) };
}

function cards(body) {
  const { original, rows } = table(body, ["Goal", "Guide"], 7);
  const rendered = rows.map(([goal, guide]) => {
    const link = guide.match(/^\[([^\]\n]+)\]\((\/agent-pass\/[^\s"'<>]+)\)$/);
    if (!goal || !link || !icons[link[2]]) review("integration goals must have one reviewed linked guide each");
    return `  <Card title="${attribute(link[1])}" icon="${icons[link[2]]}" href="${attribute(link[2])}">\n    ${goal}\n  </Card>`;
  });
  return body.replace(original, visibility(`<CardGroup cols={2}>\n${rendered.join("\n")}\n</CardGroup>`, original));
}

function environment(body) {
  const { original, rows } = table(body, ["Setting", "Value"], 3);
  if (rows.map(([label]) => label).join("|") !== "Issuer|Discovery|Developer portal") review("environment settings changed");
  const issuer = rows[0][1].match(/^`(https:\/\/[^\s`"'<>]+)`$/)?.[1];
  const discovery = rows[1][1].match(/^`(https:\/\/[^\s`"'<>]+)`$/)?.[1];
  const portal = rows[2][1].match(/^\[[^\]\n]+\]\((https:\/\/[^\s"'<>]+)\)$/)?.[1];
  if (!issuer || !discovery || !portal) review("environment URLs must retain their reviewed code/link formats");
  const json = JSON.stringify({ issuer, discovery, developer_portal: portal }, null, 2);
  const rendered = `Production URLs for your OIDC client and [developer portal](${portal}):\n\n\`\`\`json\n${json}\n\`\`\``;
  return body.replace(original, visibility(rendered, original));
}

const integrationEdits = [
  [
    "These guides cover OIDC integration with World IdP. Use World IdP's\nregistrations, credentials, and identifiers only for that flow; IDKit proof\napplications use their own.",
    "IDKit gives your application World ID proofs to verify. World IdP gives it\nOpenID Connect ID tokens to validate. Keep their registrations, credentials, and\nidentifiers separate.",
  ],
  [
    "- **IDKit uniqueness:** use a nullifier scoped to the application and action for\n  one-use eligibility. Verify the proof on your backend and atomically reject a\n  previously consumed nullifier.",
    "- **Verify a World ID proof (IDKit):** verify the complete proof on your backend.\n  For a one-use action, atomically reject any `nullifier` already accepted for that\n  app and action.",
  ],
  [
    "- **IDKit sessions:** use repeated proofs of the saved `session_id` for account\n  continuity. Each check still requires user interaction and a fresh proof.\n  Use `session_nullifier` to identify a proof for replay checks.",
    "- **Verify returning users (IDKit):** verify a new proof for the account's saved\n  `session_id` and reject reused `session_nullifier` values. Each check still\n  requires user interaction and a fresh proof.",
  ],
];

function otherIntegrations(body) {
  const warning = "\n\n**Legacy Sign In with World ID is deprecated.**";
  if (body.split(warning).length !== 2) review("legacy deprecation warning changed");
  const boundary = body.indexOf(warning);
  const original = body.slice(0, boundary).trim();
  if ((original.match(/^- /gm) ?? []).length !== 2) review("IDKit comparison bullet count changed");
  let rendered = original;
  for (const [before, after] of integrationEdits) {
    if (rendered.split(before).length !== 2) review("IDKit comparison wording changed");
    rendered = rendered.replace(before, after);
  }
  return `\n${visibility(rendered, original)}${body.slice(boundary)}`;
}

export function renderQuickstartLayout(content) {
  let result = section(content, "Choose your integration", "choose-your-integration", "Environment values", "environment-values", cards);
  result = section(result, "Environment values", "environment-values", "Other World ID integrations", "other-world-id-integrations", environment);
  return section(result, "Other World ID integrations", "other-world-id-integrations", "Get help from a coding agent", "get-help-from-a-coding-agent", otherIntegrations);
}
