// Reviewed presentation of the canonical client-authentication section.
// Keep the complete source body available in Markdown exports for agents.
import { createHash } from "node:crypto";

const heading = "## Client authentication {#client-authentication}";
const nextHeading = "## Manage credentials and callbacks {#manage-credentials-and-callbacks}";
// Full rendered canonical section, with horizontal whitespace normalized.
// Any source contract change requires a deliberate presentation review.
const expectedSectionSha256 = "64ba37fd7e634d2449c7e62b8b9e37cfb7b158ab3ee6762917cd2cae5023a40b";
const humanBody = [
  "Authenticate at the token and device authorization endpoints with your registered",
  "method. These examples show credential fragments only. Add the fields required",
  "by your grant, such as `grant_type`, an authorization code and PKCE verifier, or",
  "`device_code`, and use a form encoder for the request body.",
  "",
  "For Basic authentication, form-encode the client ID and secret separately, join",
  "them with `:`, then Base64-encode that string as `<base64-credentials>`. The body",
  "`client_id` shown below is optional; when supplied, it must match the Basic",
  "credentials. For POST and JWT authentication, omit the `Authorization` header.",
  "Replace every placeholder with the indicated encoded value.",
  "",
  "{/* cspell:disable */}",
  "<CodeGroup>",
  "```http title=\"client_secret_basic (portal default)\"",
  "Content-Type: application/x-www-form-urlencoded",
  "Authorization: Basic <base64-credentials>",
  "",
  "client_id=<form-encoded-client-id>",
  "```",
  "",
  "```http title=\"client_secret_post\"",
  "Content-Type: application/x-www-form-urlencoded",
  "",
  "client_id=<form-encoded-client-id>&client_secret=<form-encoded-client-secret>",
  "```",
  "",
  "```http title=\"private_key_jwt\"",
  "Content-Type: application/x-www-form-urlencoded",
  "",
  "client_id=<form-encoded-client-id>&client_assertion_type=urn%3Aietf%3Aparams%3Aoauth%3Aclient-assertion-type%3Ajwt-bearer&client_assertion=<form-encoded-signed-compact-assertion>",
  "```",
  "</CodeGroup>",
  "{/* cspell:enable */}",
  "",
  "For `private_key_jwt`, register the public JWKS in the portal and keep the private",
  "key in your backend. Use a JWT library to sign the header and payload below as",
  "a compact RS256 assertion. These are illustrative decoded values, not a signed",
  "assertion or reusable credentials.",
  "",
  "```json title=\"JWT header\"",
  "{",
  "  \"alg\": \"RS256\",",
  "  \"kid\": \"<registered-rsa-key-id>\"",
  "}",
  "```",
  "",
  "`kid` selects a registered RSA key of 2048–8192 bits. Omit `kid` only when exactly",
  "one key is registered.",
  "",
  "```json title=\"JWT payload\"",
  "{",
  "  \"iss\": \"<client-id>\",",
  "  \"sub\": \"<client-id>\",",
  "  \"aud\": \"https://auth.world.org\",",
  "  \"iat\": 1790000000,",
  "  \"exp\": 1790000300,",
  "  \"jti\": \"<unique-value-for-this-request>\"",
  "}",
  "```",
  "",
  "Set both `iss` and `sub` to your client ID. Use a single audience: the issuer shown",
  "above or the exact endpoint being called. Generate current `iat` and `exp` values",
  "for each request, with `exp` at most one hour after `iat`, and a unique `jti` of",
  "at most 256 bytes. Expiration is strict; `iat` and optional `nbf` allow 30 seconds",
  "of clock skew.",
  "",
  "Use a fresh assertion for every request, retry, and device poll, including after",
  "`authorization_pending`. Assertions are single-use across endpoints. A rejected",
  "assertion returns HTTP 400 `invalid_client`.",
  "Keep request bodies, Authorization headers, and callback query strings out of logs.",
].join("\n");

export function renderClientAuthentication(content) {
  const matches = [...content.matchAll(/^## Client authentication \{#client-authentication\}$/gm)];
  if (matches.length !== 1) {
    throw new Error("Client authentication examples require exactly one canonical section");
  }
  const start = matches[0].index;
  const end = content.indexOf("\n## ", start + heading.length);
  if (end < 0 || content.slice(end + 1).split("\n", 1)[0] !== nextHeading) {
    throw new Error("Client authentication section boundary changed; review its examples");
  }
  const original = content.slice(start, end);
  const normalized = original.replace(/[ \t]+/g, " ").trim();
  const actual = createHash("sha256").update(normalized).digest("hex");
  if (actual !== expectedSectionSha256) {
    throw new Error("Canonical client authentication changed; review its credential and JWT examples");
  }
  const agentBody = original.slice(heading.length).trim();
  const replacement = [
    heading, "",
    '<Visibility for="humans">', "", humanBody, "", "</Visibility>", "",
    '<Visibility for="agents">', "", agentBody, "", "</Visibility>", "",
  ].join("\n");
  return content.slice(0, start) + replacement + content.slice(end);
}
