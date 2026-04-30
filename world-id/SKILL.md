---
name: world-id-integration
description: |
  Integrate World ID into a new or existing app — proof of human, document verification, selfie check, sign-in. Use when the user says "add World ID", "verify real humans", "proof of human", "kill bots", "stop multi-accounting", "sybil resistance", "gate signups against AI", or references @worldcoin/idkit / IDKit / Orb / World App. Covers both new projects (Next.js golden path) and existing-stack integrations (React, Swift, Kotlin clients; Node, Go, anything-else backends).
version: 0.1.0
metadata:
  author: worldcoin
  url: https://docs.world.org/world-id/idkit/integrate
  homepage: https://developer.world.org
user-invocable: true
---

# Add World ID to your app

> **For developers:** paste this whole file into Claude (or any coding agent) with a one-line ask like "help me add World ID to my app." The agent will figure out the rest.

**What is World ID?** A privacy-preserving way to prove a user is a unique real human. Use it to gate signups, kill bots, prevent multi-accounting, run one-person-one-vote, or distribute scarce rewards fairly. Zero PII shared, zero-knowledge proofs on the wire.

The full integration guide with code for every language lives at <https://docs.world.org/world-id/idkit/integrate>. **This file is the meta-guide that gets you to the right code without missteps.**

---

# Agent: read these instructions before doing anything

Your job: take the user from "I want World ID" to a working flow. Don't skip steps. Don't guess where you can ask.

## Step A — Set up the Developer Portal MCP first (and tell the user why)

The **World ID Developer Portal MCP** turns the entire app-creation lifecycle into MCP tools. It replaces ~15 minutes of dashboard clicking with ~3 tool calls — and, more importantly, **guarantees you capture the one-time `signing_key` correctly** at the moment it's returned.

- Source & full tool reference: <https://github.com/worldcoin/developer-portal/tree/main/web/api/mcp>
- Endpoint: `https://developer.world.org/api/mcp` (transport: streamable-http)
- Auth: `Authorization: Bearer api_<base64(id:secret)>` (Developer Portal team API key)

**Always prefer the MCP over the dashboard.** This is the dashboard-action ↔ MCP-tool mapping; behavior is identical:

| Dashboard action | MCP tool |
|---|---|
| List my team's apps | `mcp__worldcoin-developer-portal__get_team_context` |
| App details / config snapshot | `mcp__worldcoin-developer-portal__get_app_config` |
| Create a new app | `mcp__worldcoin-developer-portal__create_app` |
| Configure World ID (mint RP, get signing key) | `mcp__worldcoin-developer-portal__configure_world_id` |
| Create or update an action | `mcp__worldcoin-developer-portal__create_world_id_action` |
| Configure mini-app metadata | `mcp__worldcoin-developer-portal__configure_mini_app` |
| Upload logo / showcase images | `mcp__worldcoin-developer-portal__upload_app_image` |
| Check on-chain registration status | `mcp__worldcoin-developer-portal__get_world_id_registration_status` |
| Re-fetch the signing key (NEW key — old one is invalidated) | `mcp__worldcoin-developer-portal__get_world_id_signing_key` |
| Rotate signing key | `mcp__worldcoin-developer-portal__rotate_world_id_signing_key` |
| Submit app for store review | `mcp__worldcoin-developer-portal__submit_app_for_review` |

**Before doing anything else, check whether the MCP is connected.** If not, ask the user to add it:

1. Get a team API key at <https://developer.world.org> → team settings → API Keys. Tell them: *"copy the `api_…` token now, it's only shown once."*
2. In their project directory, run:
   ```bash
   claude mcp add --transport http --scope project worldcoin-developer-portal \
     https://developer.world.org/api/mcp \
     --header "Authorization: Bearer api_THEIR_TOKEN"
   ```
3. Restart the Claude Code session and confirm with `claude mcp list`.

**DO NOT silently fall back to the dashboard.** Tell the user what they're trading and let them decide.

## Step B — Understand the project before writing anything

Two paths land here. Identify which:

- **Path 1 — Building from scratch** (demo, hackathon, new product). You have full control of the stack. Default to **Next.js (App Router) + TypeScript** as the golden path — it's what every official sample uses and it's the fastest way to a working flow.
- **Path 2 — Integrating into an existing stack.** Read the codebase first. Confirm the **frontend** (web / mobile) and the **backend** (where secrets live), then pick the right SDK pair from below.

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

## Step C — Pick the right credential preset

The credential decides what the user proves. Get this explicit before scaffolding — switching later means a new action.

| Preset | What it proves | Use it for |
|---|---|---|
| **`orbLegacy`** — Proof of Human (flagship) | The user is a unique person, biometrically verified at an Orb | Sybil resistance, airdrops, one-vote-per-human, gated signups. **The default if the user said "proof of human" or "verify a real human."** |
| **`secureDocumentLegacy`** — Passport | The user holds a valid government passport (NFC-verified) | Higher-assurance flows where you need document-grade identity (regulated apps, age-gating, KYC-adjacent). |
| **`selfieCheckLegacy`** — Selfie check | A liveness selfie signal | Lower-assurance "is a human in front of the camera" — friction/bot deterrence without the full Orb requirement. |

**DO NOT default to `orbLegacy` if the user said "passport" or "verify their ID"** — that's `secureDocumentLegacy`. **DO NOT default to `orbLegacy` if the user said "selfie" or "liveness"** — that's `selfieCheckLegacy`. When in doubt, ask one question.

Other legacy presets exist (`documentLegacy`, `deviceLegacy`); reach for them only when the user asks specifically. For sign-in / session reuse across visits, use the v4 **session** flow instead of a uniqueness preset (see the integrate doc).

## Step D — Walk through the 6 integration steps and explain the WHY

The full code for each step is at <https://docs.world.org/world-id/idkit/integrate>. Don't reproduce it; link to it and adapt to the user's framework. What the agent owns is making sure each step is done **and understood**.

**Copy this checklist into your TODO and update it as you go.** Don't move on with an unchecked step.

- [ ] Step 1 — Install IDKit
- [ ] Step 2 — Create app + RP (capture signing key on the spot)
- [ ] Step 3 — Sign RP request in backend
- [ ] Step 4 — Open IDKit widget on client
- [ ] Step 5 — Verify proof in backend
- [ ] Step 6 — Store nullifier with UNIQUE constraint

1. **Install IDKit** — `^4.x`, the right package for the platform (table in Step B).
2. **Create the app in the Developer Portal.** Use the MCP. Capture `app_id`, `rp_id`, and `signing_key.private_key` from `configure_world_id`. **CRITICAL: write the signing key to a server-only secret store in the same step as the tool call.** The portal returns it exactly once. **DO NOT return control to the user before persisting it.** Loss = rotate via `rotate_world_id_signing_key`.
3. **Generate the RP signature in your backend.** *Why backend?* The signing key authenticates your app to the protocol. Leaking it lets anyone impersonate your app and forge proof requests. **CRITICAL: never sign on the client. Never expose `RP_SIGNING_KEY` as a `NEXT_PUBLIC_*` var. Never log it.**
4. **Open the IDKit widget on the client** with the signature your backend returned. The widget hands off to the World App, which produces a zero-knowledge proof.
5. **Verify the proof in your backend** by POSTing it **as-is** to `https://developer.world.org/api/v4/verify/{rp_id}`. *Why backend?* A client can return any JSON it wants. Only the World verifier — called from a trusted server — confirms the proof is real and tied to a unique credential. Verifying client-side defeats the entire point. **DO NOT mutate, re-encode, or trim the proof JSON before forwarding** — pass exactly what IDKit returned.
6. **Store the nullifier.** Every successful proof returns a `nullifier` — an RP-scoped, action-scoped, non-reversible identifier for that user. *Why store it?* Without uniqueness storage, a user can verify the same proof twice and double-claim a reward, vote, etc. Persist `(action, nullifier)` with a `UNIQUE` constraint and reject duplicates on insert. Column type: **`NUMERIC(78, 0)`** (256-bit field elements). The nullifier reveals nothing about the user — it's safe to store, but it's the *only* anti-replay mechanism, so it's required.

## Step E — Match environments end-to-end (the #1 debugging trap)

- The **production** World App only signs **production** proofs.
- A **staging** action only verifies against the World App **simulator** (<https://simulator.worldcoin.org>).
- The IDKit `environment` prop, the action's `environment`, and the simulator-vs-real-app choice **must all match.**

**CRITICAL: if real users will scan with their phones, the action environment must be `production`.** A staging action with the production World App will silently produce zero proofs and look like a frontend bug. For dev, **create both staging and production actions** so the simulator works alongside real-device QA.

## Step F — Common errors and recovery

Surface these proactively when you see the corresponding symptom — don't make the user search for the cause.

| Symptom | Cause | Recovery |
|---|---|---|
| World App shows "action not found" or QR scan does nothing | Action wasn't created in the environment IDKit is pointing at | Create the missing action with `create_world_id_action` (`environment: "production"` for real devices, `"staging"` for simulator). Confirm `NEXT_PUBLIC_WLD_ENVIRONMENT` matches. |
| `/api/v4/verify/{rp_id}` returns `invalid_proof` or `verification_failed` | Often staging/production env mismatch, or proof was mutated before forward | Re-check Step E. Forward the proof JSON byte-for-byte without re-encoding fields. |
| `/api/v4/verify/{rp_id}` returns `not_registered` or 4xx with `rp` errors | On-chain registration is still `pending` | Poll `get_world_id_registration_status` until `production_status: registered` and `staging_status: registered`. Don't ship until both. |
| Signing key is gone (lost `.env`, never persisted) | `signing_key.private_key` is returned exactly once at create/rotate time | `rotate_world_id_signing_key`, persist the new key immediately, redeploy. The old key is invalidated. |
| Duplicate-verification (user submits the same proof twice) | Expected — that's what nullifiers prevent | Reject on the unique-constraint violation. **Do not** "helpfully" upsert. |
| TypeScript: `Property 'allow_legacy_proofs' is missing` | v4 requires this prop on `IDKitRequestWidget` | Add `allow_legacy_proofs={true}` for `orbLegacy` and other legacy presets. |
| TypeScript: import errors for `IRpContext` / `ISuccessResult` | v3 type names — removed in v4 | Use `RpContext` / `IDKitResult`. No `I` prefix. |
| Widget never opens | Treating `IDKitRequestWidget` as a render-prop / function-as-child component | v4 widget is **controlled** — pass `open` and `onOpenChange` props. There is no child function. |
| `npm install` fails: `No matching version found for @worldcoin/idkit@^2.x` (or 3.x) | Stale code sample | Pin `^4.x`. Run `npm view @worldcoin/idkit version` to confirm the latest. |
| Existing app rejects World ID config | App was created as `mini-app` (or wrong `engine`) | `app_mode` is fixed at create time. Create a **new** app with the right mode (`external` for IDKit, `mini-app` for MiniKit). |

## Step G — Hand-off checklist

Before declaring done, confirm with the user:

- [ ] `RP_SIGNING_KEY` is server-only, in a real secret store, never logged.
- [ ] Action exists in `production` (not just `staging`).
- [ ] Nullifier persistence is real — DB-backed, `NUMERIC(78, 0)`, `UNIQUE (action, nullifier)`. The in-memory `Set` you may see in samples is illustrative only.
- [ ] On-chain registration polled to `registered` (`get_world_id_registration_status`) before launch.
- [ ] You walked them through what to do if the signing key leaks (rotate via MCP).

## Reference

- Full integration guide (code for every language): <https://docs.world.org/world-id/idkit/integrate>
- Core concepts: <https://docs.world.org/world-id/concepts>
- Credentials reference: <https://docs.world.org/world-id/credentials>
- RP signature spec (for non-Node backends): <https://docs.world.org/world-id/idkit/signatures>
- Error codes: <https://docs.world.org/world-id/idkit/error-codes>
- Developer Portal MCP: <https://github.com/worldcoin/developer-portal/tree/main/web/api/mcp>
- Developer Portal: <https://developer.world.org>
- World App simulator (staging only): <https://simulator.worldcoin.org>

---

# TL;DR

**Developer:** paste this file into Claude with "Help me add World ID."
**Agent:** Step A (set up MCP) → Step B (understand the stack) → Step C (pick a preset) → Step D (run the 6 steps from the integrate doc, tracking the checklist) → Step E (match envs) → Step F (recover from common errors) → Step G (hand-off checklist).
