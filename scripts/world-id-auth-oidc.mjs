// Presentation-only examples. Agent exports retain the original requests and table.
const visibility = (human, original) => `<Visibility for="humans">\n${human}\n</Visibility>\n\n<Visibility for="agents">\n${original}\n</Visibility>`;
const requests = [
  { title: "Authorization parameters", method: "GET", endpoint: "authorize", keys: ["client_id", "redirect_uri", "response_type", "scope", "state", "nonce", "code_challenge", "code_challenge_method"], constants: { response_type: "code", scope: "openid", code_challenge_method: "S256" } },
  { title: "Code exchange", method: "POST", endpoint: "token", keys: ["grant_type", "client_id", "client_secret", "code", "redirect_uri", "code_verifier"], constants: { grant_type: "authorization_code" } },
  { title: "Device authorization", method: "POST", endpoint: "device_authorization", keys: ["client_id", "client_secret", "scope"], constants: { scope: "openid" } },
  { title: "Device token polling", method: "POST", endpoint: "token", keys: ["grant_type", "client_id", "client_secret", "device_code"], constants: { grant_type: "urn:ietf:params:oauth:grant-type:device_code" } },
];
const responseLabels = [
  "HTTP 400 `authorization_pending`",
  "HTTP 400 `slow_down`",
  "`access_denied`, `expired_token`, `invalid_grant`, other OAuth error",
  "HTTP 503",
  "HTTP 429",
  "Connection timeout",
];
const responseActions = [
  "Keep waiting and poll again after the interval.",
  "Add five seconds to all later intervals. An early poll can return this before the grant is checked; it never extends the attempt's expiry.",
  "Stop polling.",
  "Temporary unavailability, never approval. End this attempt.",
  "Per-network-address flood protection on back-channel endpoints, separate from the per-client limits. It can end the attempt; `Retry-After` does not override the stop rules.",
  "Back off before polling again.",
];

function review(message) {
  throw new Error(`OIDC examples require review: ${message}`);
}

function requestExample(original, source, expected) {
  const lines = source.split("\n");
  const endpoint = lines.shift();
  if (endpoint !== `${expected.method} https://auth.world.org/api/v1/${expected.endpoint}`) {
    review(`endpoint or order changed for ${expected.title}`);
  }
  let contentType;
  if (lines[0]?.startsWith("Content-Type:")) {
    contentType = lines.shift();
    if (expected.method !== "POST" || contentType !== "Content-Type: application/x-www-form-urlencoded") {
      review(`content type changed for ${expected.title}`);
    }
  }
  while (lines[0] === "") lines.shift();
  const pairs = lines.map((line) => {
    const match = line.match(/^([a-z_]+)=(.+)$/);
    if (!match) review(`unrecognized request field for ${expected.title}`);
    return [match[1], match[2]];
  });
  const keys = pairs.map(([key]) => key);
  if (new Set(keys).size !== keys.length || keys.length !== expected.keys.length ||
      [...keys].sort().join("|") !== [...expected.keys].sort().join("|")) {
    review(`parameter keys changed for ${expected.title}`);
  }
  const parameters = Object.fromEntries(pairs);
  if (Object.entries(expected.constants).some(([key, value]) => parameters[key] !== value)) {
    review(`request profile changed for ${expected.title}`);
  }
  const lead = `\`${endpoint}\`${contentType ? ` with \`${contentType}\`` : ""}.`;
  const encoding = expected.method === "GET"
    ? "Send these as URL-encoded query parameters."
    : "Form-encode these fields; do not send JSON.";
  const human = `${lead}\n\n${encoding}\n\n<CodeGroup>\n\`\`\`json title="${expected.title}"\n${JSON.stringify(parameters, null, 2)}\n\`\`\`\n</CodeGroup>`;
  return visibility(human, original);
}

function pollingResponses(content) {
  const tables = [...content.matchAll(/^\|[^\n]*\|[ \t]*(?:\n\|[^\n]*\|[ \t]*)+$/gm)]
    .filter(([value]) => value.split("\n")[0].split("|")[1]?.trim() === "Poll response");
  if (tables.length !== 1) review("expected one device polling response table");
  const original = tables[0][0];
  const rows = original.split("\n").map((line) => line.trim().slice(1, -1).split("|").map((cell) => cell.trim()));
  if (rows.length !== 8 || rows.some((row) => row.length !== 2) ||
      rows[0].join("|") !== "Poll response|What to do" || !rows[1].every((cell) => /^:?-{3,}:?$/.test(cell))) {
    review("polling response table columns or row count changed");
  }
  const responses = rows.slice(2);
  if (responses.some(([label, action], index) => label !== responseLabels[index] ||
      action.replace(/\s+/g, " ") !== responseActions[index])) {
    review("polling response labels or actions changed");
  }
  const oauth = (error, status) => `${status ? `HTTP ${status}.\n\n` : ""}\`\`\`json\n${JSON.stringify({ error }, null, 2)}\n\`\`\``;
  const options = [
    ["authorization_pending", oauth("authorization_pending", 400), responses[0][1]],
    ["slow_down", oauth("slow_down", 400), responses[1][1]],
    ["access_denied", oauth("access_denied"), responses[2][1]],
    ["expired_token", oauth("expired_token"), responses[2][1]],
    ["invalid_grant", oauth("invalid_grant"), responses[2][1]],
    ["Other OAuth errors", "Any other OAuth error.", responses[2][1]],
    ["HTTP 503", "```http\nHTTP/1.1 503\n```", responses[3][1]],
    ["HTTP 429", "```http\nHTTP/1.1 429\n```", responses[4][1]],
    ["Timeout", "No HTTP response.", responses[5][1]],
  ];
  const tabs = options.map(([title, example, action]) => `  <Tab title="${title}">\n\n${example}\n\n${action}\n\n  </Tab>`);
  return content.replace(original, visibility(`<Tabs>\n${tabs.join("\n")}\n</Tabs>`, original));
}

export function renderOidcExamples(content) {
  if (typeof content !== "string") review("expected a converted MDX body");
  const blocks = [...content.matchAll(/^```text\n([\s\S]*?)\n```$/gm)];
  if (blocks.length !== requests.length) review("expected four reviewed request blocks");
  let index = 0;
  const result = content.replace(/^```text\n([\s\S]*?)\n```$/gm, (original, source) => requestExample(original, source, requests[index++]));
  return pollingResponses(result);
}
