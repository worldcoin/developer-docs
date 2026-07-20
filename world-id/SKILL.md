---
name: world-id-integration
description: |
  Use this skill when adding, upgrading, debugging, or testing World ID verification with IDKit in a new or existing web or mobile app. Covers Proof of Human, passport/document, Face Check, and session/sign-in flows; Developer Portal app, RP, and action setup; server-side signing and proof verification; environment matching; nullifier replay protection; and launch testing. Trigger when the user asks to add World ID, verify humans, stop bots or multi-accounting, add Sybil resistance, or mentions IDKit, Orb, World ID proof flows, World App proof flows, @worldcoin/idkit, signing keys, rp_id, or app_id.
version: 0.1.0
metadata:
  author: worldcoin
  url: https://docs.world.org/world-id/idkit/integrate
  homepage: https://developer.world.org
user-invocable: true
---

{/* cspell:ignore streamable biometrically */}

# Add World ID to your app

> **For developers:** give this file to your coding agent with a one-line ask like "help me add World ID to my app." The agent will figure out the rest.

**What is World ID?** A privacy-preserving way to prove a user is a unique real human. Use it to gate signups, kill bots, prevent multi-accounting, run one-person-one-vote, or distribute scarce rewards fairly. Zero PII shared, zero-knowledge proofs on the wire.

The full integration guide with code for every language lives at [https://docs.world.org/world-id/idkit/integrate](https://docs.world.org/world-id/idkit/integrate). **This file is the meta-guide that gets you to the right code without missteps.**

---

# Agent: read these instructions before doing anything

Take the user from "I want World ID" to a verified working flow. Inspect first, ask only for missing information, and resume from the user's actual state rather than restarting setup.

## Phase 0 — Establish readiness

Before changing code or creating Portal resources:

1. Read the project and inspect connected tools. Do not ask for information you can infer.
2. Establish the current state:
   - integration goal and credential preset
   - new or existing project; client, backend, package manager, and persistence layer
   - Developer Portal account/team, `app_id`, `rp_id`, and action
   - target environment and test path: staging simulator, production World ID, or both
   - Developer Portal MCP connection
   - whether an RP signing key already exists in a server-side secret store
   - credential access, especially Face Check
3. Report a short readiness summary and ask only for unresolved blockers. **Never ask the user to paste a signing key, Portal API key, or other secret into chat.** Ask only whether it exists and where the application expects it.
4. Build a TODO from the missing steps. Preserve working configuration and existing Portal resources unless the user explicitly wants replacements.

Do not generate or rotate an RP signing key until a server-only secret destination is ready. Rotation invalidates the old signer: explain the impact and get explicit confirmation first.

## Phase 1 — Use the Developer Portal MCP when available

The **World ID Developer Portal MCP** turns the app-creation lifecycle into MCP tools. It replaces dashboard setup with a few tool calls and makes the one-time `signing_key` response explicit so the agent can persist it immediately.

- Source & full tool reference: [https://github.com/worldcoin/developer-portal/tree/main/web/api/mcp](https://github.com/worldcoin/developer-portal/tree/main/web/api/mcp)
- Endpoint: `https://developer.world.org/api/mcp` (transport: streamable-http)
- Auth: `Authorization: Bearer api_<base64(id:secret)>` (Developer Portal team API key)

Prefer the MCP over the dashboard when connected. Start with `get_team_context`, then `get_app_config` for the selected app before creating anything. Clients may namespace MCP tools differently; match these final tool names:

| Dashboard action | MCP tool |
|---|---|
| List my team's apps | `get_team_context` |
| App details / config snapshot | `get_app_config` |
| Create a new app | `create_app` |
| Configure World ID (mint RP, get signing key) | `configure_world_id` |
| Create or update an action | `create_world_id_action` |
| Check on-chain registration status | `get_world_id_registration_status` |
| Read the current signer address (never the private key) | `get_world_id_signing_key` |
| Rotate signing key (returns the new private key once) | `rotate_world_id_signing_key` |

If the MCP is not connected, explain that it can inspect and configure the user's Portal resources directly. Offer the client-specific setup at [https://docs.world.org/model-context-protocol/developer-portal](https://docs.world.org/model-context-protocol/developer-portal), or let the user continue through the dashboard. **Do not silently choose a path or block an otherwise valid integration on MCP setup.**

## Phase 2 — Understand the project before writing anything

Two paths land here. Identify which:

- **Path 1 — Building from scratch** (demo, hackathon, new product). You control the full stack. Default to **Next.js (App Router) + TypeScript** as the golden path — every official sample uses it and it's the fastest way to a working flow.
- **Path 2 — Integrating into an existing stack.** Read the codebase first. Confirm the **frontend** (web / mobile) and the **backend** (where secrets live), then pick the right SDK pair below.

Supported clients and backends — all interoperable:

| Client | SDK |
|---|---|
| React / Next.js | `@worldcoin/idkit` (pre-built widget) |
| Other JS / vanilla web | `@worldcoin/idkit-core` |
| iOS | [`worldcoin/idkit-swift`](https://github.com/worldcoin/idkit-swift) |
| Android | `com.worldcoin:idkit` (Gradle) |

| Backend | RP signing | Proof verify |
|---|---|---|
| Node / Next.js | `@worldcoin/idkit-core/signing` | `fetch` to `developer.world.org/api/v4/verify/{rp_id}` |
| Go | server SDK in `/world-id/idkit/go` | same HTTPS POST |
| Anything else | re-implement signing ([signatures spec](https://docs.world.org/world-id/idkit/signatures)) | same HTTPS POST |

**DO NOT pin SDKs to `^2.x` or `^3.x`** — those examples litter the public internet and **will not work** with v4. The API was redesigned. Pin **`^4.x`** and verify with `npm view @worldcoin/idkit version` if uncertain.

## Phase 3 — Pick the credential and confirm access

The credential decides what the user proves. Nail this down before scaffolding — switching later means a new action.

| Preset | What it proves | Use it for |
|---|---|---|
| **`proofOfHuman`** — Proof of Human (flagship) | The user is a unique person, biometrically verified at an Orb | Sybil resistance, airdrops, one-vote-per-human, gated signups. **The default if the user said "proof of human" or "verify a real human."** |
| **`passport`** — Passport | The user holds a valid government passport (NFC-verified) | Higher-assurance flows where you need document-grade identity (regulated apps, age-gating, KYC-adjacent). |
| **`selfieCheckLegacy`** — Selfie check | A liveness selfie signal | Lower-assurance "is a human in front of the camera" — friction/bot deterrence without the full Orb requirement. |

**DO NOT default to `proofOfHuman` if the user said "passport" or "verify their ID"** — that's `passport`. **DO NOT default to `proofOfHuman` if the user said "selfie" or "liveness"** — that's `selfieCheckLegacy`. When in doubt, ask one question.

Other legacy presets exist (`documentLegacy`, `deviceLegacy`); reach for them only when the user asks specifically. For sign-in / session reuse across visits, use the v4 **session** flow instead of a uniqueness preset (see the integrate doc).

### Face Check access gate

After the app and action exist—but before implementing or opening a Face Check flow—confirm the `app_id` is enabled:

If either resource is missing, mark this gate pending, provision the resource in Phase 4 step 2, and return here before implementing the client request.

1. Prefer `get_app_config` if the MCP response exposes `enable_face_check`.
2. Otherwise call the public precheck endpoint with the real app and action:

   ```http
   POST https://developer.world.org/api/v1/precheck/{app_id}
   Content-Type: application/json

   { "action": "your-action" }
   ```

3. Read `enable_face_check` from the response:
   - `true`: continue.
   - `false`: stop and tell the user Face Check is not enabled for this app. Point them to their World contact or a documented support path to request access; if none is documented, say so instead of inventing one. Do not let the integration fail as an unexplained spinner.
   - missing field or failed precheck: treat access as unknown, surface the response details, and resolve the gate before continuing.

Do not interpret a valid app, RP, or action as proof of Face Check access. It is a separate app-level capability.

## Phase 4 — Implement the 6 integration steps and explain the WHY

The full code for each step is at [https://docs.world.org/world-id/idkit/integrate](https://docs.world.org/world-id/idkit/integrate). Don't reproduce it; link to it and adapt to the user's framework. The agent owns making sure each step is done **and understood**.

**Copy this checklist into your TODO and update it as you go.** Don't move on with an unchecked step.

- [ ] Step 1 — Install IDKit
- [ ] Step 2 — Create or reuse app + RP + action (store any newly generated signing key immediately)
- [ ] Step 3 — Sign RP request in backend
- [ ] Step 4 — Open IDKit widget on client
- [ ] Step 5 — Verify proof in backend
- [ ] Step 6 — Store nullifier with UNIQUE constraint

1. **Install IDKit** — `^4.x`, the right package for the platform (table in Phase 2).
2. **Create or reuse the Portal resources.** Use the MCP when available. Reuse an existing app, RP, and action when they match the requested integration. For a new RP, capture `app_id`, `rp_id`, and `signing_key.private_key` from `configure_world_id`, create the action in the intended environment, and write the signing key to the prepared server-only secret store in the same step. The portal returns it exactly once. **Do not print, log, or return the private key to chat.** If the key is lost, explain that `get_world_id_signing_key` cannot recover it; rotation creates a new key and invalidates the old signer.
3. **Generate the RP signature in your backend.** *Why backend?* The signing key authenticates your app to the protocol. Leaking it lets anyone impersonate your app and forge proof requests. **CRITICAL: never sign on the client. Never expose `RP_SIGNING_KEY` as a `NEXT_PUBLIC_*` var. Never log it.**
4. **Open the IDKit widget on the client** with the signature your backend returned. The widget hands off to World ID, which produces a zero-knowledge proof.
5. **Verify the proof in your backend** by POSTing it **as-is** to `https://developer.world.org/api/v4/verify/{rp_id}`. *Why backend?* A client can return any JSON it wants. Only the World verifier — called from a trusted server — confirms the proof is real and tied to a unique credential. Verifying client-side defeats the entire point. **DO NOT mutate, re-encode, or trim the proof JSON before forwarding** — pass exactly what IDKit returned.
6. **Store the nullifier.** Every successful proof returns a `nullifier` — an RP-scoped, action-scoped, non-reversible identifier for that user. *Why store it?* Without uniqueness storage, a user can verify the same proof twice and double-claim a reward, vote, etc. Persist `(action, nullifier)` with a `UNIQUE` constraint and reject duplicates on insert. Column type: **`NUMERIC(78, 0)`** (256-bit field elements). The nullifier reveals nothing about the user — safe to store, but it's the *only* anti-replay mechanism, so it's required.

## Phase 5 — Match environments end-to-end

- The **production** World ID app only signs **production** proofs.
- A **staging** action only verifies against the World ID **Simulator** ([https://simulator.worldcoin.org](https://simulator.worldcoin.org)).
- The IDKit `environment` prop, the action's `environment`, and the simulator-vs-real-app choice **must all match.**

**CRITICAL: if real users will scan with their phones, the action environment must be `production`.** A staging action with the production World ID app will silently produce zero proofs and look like a frontend bug. If the user needs both simulator testing and real-device QA, create separate staging and production actions.

## Phase 6 — Test the integration end-to-end

Do not declare the integration complete from compilation or Portal configuration alone. Test the selected path and record evidence:

- [ ] RP-signing endpoint succeeds without exposing or logging secrets.
- [ ] Widget/request opens in the selected environment.
- [ ] The selected credential completes with the staging simulator or production World ID as intended.
- [ ] Backend verification succeeds and the exact IDKit result reaches `/api/v4/verify/{rp_id}`.
- [ ] The verified nullifier is persisted.
- [ ] Replaying the same nullifier is rejected by the database uniqueness constraint.
- [ ] Relevant failures—unavailable Face Check, invalid action/signature, or environment mismatch—produce an actionable user-facing error instead of an indefinite loading state.
- [ ] JS/React failures retain the `debugReport` and `request_id` needed for diagnosis without logging secrets.

Run automated tests for the routes and persistence behavior. Clearly identify simulator, phone, or production checks that still require the user; never imply a manual proof flow ran when it did not.

If a check fails, use the concrete error, response payload, or execution trace to fix the root cause, then rerun the failed check and any downstream checks. Do not weaken a security or access gate just to make validation pass.

## Phase 7 — Gotchas and recovery

Surface these proactively when you see the matching symptom — don't make the user search for the cause.

| Symptom | Cause | Recovery |
|---|---|---|
| Face Check appears unresponsive or never starts | The app may not be enabled for Face Check | Read `enable_face_check` through MCP when available or `/api/v1/precheck/{app_id}`. If false, stop and explain how to request access. |
| World ID shows "action not found" or QR scan does nothing | Action wasn't created in the environment IDKit is pointing at | Create the missing action with `create_world_id_action` (`environment: "production"` for real devices, `"staging"` for simulator). Confirm `NEXT_PUBLIC_WLD_ENVIRONMENT` matches. |
| `/api/v4/verify/{rp_id}` returns `invalid_proof` or `verification_failed` | Often staging/production env mismatch, or proof was mutated before forward | Re-check Phase 5. Forward the proof JSON byte-for-byte without re-encoding fields. |
| Verification fails in JS/React and the error code alone isn't enough | Need transport/payload diagnostics | Read `getDebugReport()` (or the `onError` `debugReport` arg) — it carries `transport`, `request_id`, request/response payloads, and World App `mini_app` channel info. JS SDKs only. |
| `/api/v4/verify/{rp_id}` returns `not_registered` or 4xx with `rp` errors | On-chain registration is still `pending` | Poll `get_world_id_registration_status` until the intended environment is `registered`. Production must be registered before launch. |
| Signing key is gone (lost `.env`, never persisted) | `signing_key.private_key` is returned exactly once at create/rotate time | Prepare the replacement secret destination, explain the invalidation impact, get confirmation, then call `rotate_world_id_signing_key`, persist the new key immediately, and redeploy. |
| Duplicate-verification (user submits the same proof twice) | Expected — that's what nullifiers prevent | Reject on the unique-constraint violation. **Do not** "helpfully" upsert. |
| TypeScript: `Property 'allow_legacy_proofs' is missing` | v4 requires this prop on `IDKitRequestWidget` | Add `allow_legacy_proofs={true}` for `proofOfHuman`, `orbLegacy`, and other legacy/fallback presets. |
| TypeScript: import errors for `IRpContext` / `ISuccessResult` | v3 type names — removed in v4 | Use `RpContext` / `IDKitResult`. No `I` prefix. |
| Widget never opens | Treating `IDKitRequestWidget` as a render-prop / function-as-child component | v4 widget is **controlled** — pass `open` and `onOpenChange` props. There is no child function. |
| `npm install` fails: `No matching version found for @worldcoin/idkit@^2.x` (or 3.x) | Stale code sample | Pin `^4.x`. Run `npm view @worldcoin/idkit version` to confirm the latest. |
| Existing app rejects World ID config | App was created as `mini-app` (or wrong `engine`) | `app_mode` is fixed at create time. Create a **new** app with the right mode (`external` for IDKit, `mini-app` for MiniKit). |

## Phase 8 — Hand off with evidence

Before declaring done, report:

- the readiness state you found and which path you followed
- files and routes changed
- `app_id`, `rp_id`, action, and environments configured—never secret values
- commands and tests run, with results
- simulator, phone, or production checks still outstanding
- blockers and exact recovery steps

For launch readiness, also confirm:

- [ ] `RP_SIGNING_KEY` is server-only, in a real secret store, never logged.
- [ ] Action exists in `production` (not just `staging`).
- [ ] Nullifier persistence is real — DB-backed, `NUMERIC(78, 0)`, `UNIQUE (action, nullifier)`. The in-memory `Set` in samples is illustrative only.
- [ ] On-chain registration polled to `registered` (`get_world_id_registration_status`) before launch.
- [ ] The user knows that a leaked or lost signing key requires confirmed rotation and redeployment.

## Reference

- Full integration guide (code for every language): [https://docs.world.org/world-id/idkit/integrate](https://docs.world.org/world-id/idkit/integrate)
- Core concepts: [https://docs.world.org/world-id/concepts](https://docs.world.org/world-id/concepts)
- Credentials reference: [https://docs.world.org/world-id/credentials](https://docs.world.org/world-id/credentials)
- RP signature spec (for non-Node backends): [https://docs.world.org/world-id/idkit/signatures](https://docs.world.org/world-id/idkit/signatures)
- Error codes: [https://docs.world.org/world-id/idkit/error-codes](https://docs.world.org/world-id/idkit/error-codes)
- Developer Portal MCP: [https://github.com/worldcoin/developer-portal/tree/main/web/api/mcp](https://github.com/worldcoin/developer-portal/tree/main/web/api/mcp)
- Developer Portal: [https://developer.world.org](https://developer.world.org)
- World ID Simulator (staging only): [https://simulator.worldcoin.org](https://simulator.worldcoin.org)

---

# TL;DR

**Developer:** give this file to a coding agent with "Help me add World ID."
**Agent:** establish readiness → inspect or configure Portal resources → understand the stack → pick a credential and confirm access → implement → match environments → test end-to-end → hand off with evidence.
