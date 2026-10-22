# VidSprout.ai — Technical Prototype Plan

**Date:** 22 October 2026  
**Status:** Planned; no runs or measurements completed  
**Design:** [System architecture](./SYSTEM-ARCHITECTURE-V1.md)  
**Scope:** Validate the risky integrations before building the complete V1 dashboard.

## 1. What to build first

A minimal authenticated test page with topic entry, an upload option, orientation, Generate, job status, and private playback/download. It is an engineering harness, not the finished four-step interface.

Use one built-in explainer template, one English voice, 720p, and no music/stock assets in the first test. These choices isolate speech timing, render execution, and durable output. Full templates/styles/music and social scheduling remain required later under the PRD.

## 2. Prerequisites and boundaries

- A MongoDB database compatible with Better Auth and required transactions.
- A Vercel project with eligible Sandbox access, Inngest environment, private R2 storage, and appropriate Gemini/ElevenLabs access.
- Verify actual plan allowances before calls. No paid subscription/overage authorization is implied by choosing a service.
- Use non-sensitive test content until provider data-handling conditions are resolved.
- Obtain an authorized test voice recording; do not invent a user upload. A synthetic fixture can test transport, but does not prove the real user-recording path.
- Use only controlled test social accounts for later validation. Prepare exact artifacts/metadata before requesting any missing live-publication authorization.
- Missing credentials block live runs, not local schema, authorization, or orchestration tests. Never record mocked tests as successful live integration.

## 3. Ordered experiments

| Experiment | Work | Evidence required to pass |
|---|---|---|
| P0 — Private skeleton | Minimal Next.js/Node app, Better Auth/MongoDB, two test accounts | Signup/login/session work; second account cannot retrieve first account's project |
| P1 — Durable storage | Direct scoped R2 upload, backend validation, authenticated download | Correct checksum/ownership; expired URL and oversized input handled; no public bucket route |
| P2 — Orchestrated fixed render | Job/outbox → Inngest → Sandbox → Remotion template → R2 → final DB record | Browser can close; valid MP4 survives Sandbox shutdown; replay does not produce a second selected final render |
| P3 — Real AI narration | Topic → Gemini script → ElevenLabs audio/timestamps → timed scenes → rendering | Playable synchronized result, actual duration <=90 seconds; request IDs and measured stage timings |
| P4 — Uploaded speech | Real English recording → decode → WhisperX CPU trial → same scene/render path | Original voice retained; alignment passes annotated checks; cold-start/model memory/latency recorded |
| P5 — Format and boundaries | Both orientations; short and near-90-second sources | No clipped text; exact cap enforced without cutting speech; over-limit upload rejected |
| P6 — Failure injection | Restart/replay, lost response, R2 upload failure, expired URL, cancel during render | Correct state, cleanup, no cross-owner access, no blind duplicate provider side effects |
| P7 — Publishing access spike | Check eligible accounts, upload/processing/private states, permitted controlled publication | Per-platform evidence, required permissions, media specs, processing latency, unknown-outcome recovery |
| P8 — Scheduling proof | Prepare + durable delay + publish; reschedule/cancel; partial failure | Independent statuses, no stale-revision post, UTC/timezone behavior, no duplicate successful destination |

P7 access investigation should start early alongside P2–P4 because platform access can block launch independently of rendering. Actual publication is not required to validate the initial generation milestone, but is required before declaring full V1 done.

## 4. Representative samples

1. **Topic:** “Explain evaporation to a beginner.” Let AI choose length. Check narration, diagram labels, and phrase-triggered animation.
2. **Notes:** Three study tips with one supplied numerical fact. Confirm the script preserves the number and visuals do not invent statistics.
3. **Uploaded voice:** Clean approximately 52-second English recording; preserve its words, pauses, and identity in landscape output.
4. **Timing boundaries:** 89.9-, 90.0-, and 90.1-second test audio, including speech near the end. Exercise audio/video padding and frame rounding.
5. **Invalid samples:** Silence, corrupt upload, oversized file, non-English speech, strong noise/overlap, missing alignment tokens, and deliberately overflowing headings.

Fixtures may be generated locally for deterministic timing boundaries. Keep their provenance and distinguish them from real speech-quality evaluations.

## 5. Measurement sheet

Record one row per attempt in a local CSV/JSON report when experiments execute:

`runId, experimentId, inputMode, inputDurationMs, orientation, templateBuild, voiceModel, transcriptModel, queueMs, planningMs, voiceMs, transcriptionColdStartMs, transcriptionMs, renderColdStartMs, renderMs, persistenceMs, totalMs, sandboxResources, outputDurationMs, outputBytes, cueErrorP95Ms, maxDriftMs, providerUsage, outcome, failureCategory`

- Include warm and cold runs; a single warm success is insufficient.
- Measure synchronized cues against human-annotated ground truth, not against the model's own timestamps alone.
- Capture a frame from each scene in both orientations and inspect clipping, readability, and visual correspondence.
- Cost report distinguishes measured usage from estimated money and missing provider information; do not report a zero cost merely because a bill has not arrived.
- Reconcile cleanup: no abandoned running Sandbox and no inaccessible final artifact marked successful.

## 6. Prototype acceptance and stop rules

The generation prototype passes when P0–P6 have recorded evidence, both real input paths work, private isolation passes, and no critical unresolved synchronization/duration/recovery defect remains.

Compare measured latency against the PRD's proposed P95 five-minute target, but do not infer a P95 from only a few runs. A first small-sample report should state its sample count and observed range; load/pilot validation comes later.

Stop or pause live tests if provider eligibility is unclear, free capacity is exhausted, a timeout leaves a possibly billable call unresolved, or an authorization/ownership defect is found. Preserve diagnostics and propose the smallest correction. Do not automatically upgrade plans or substitute providers.

If WhisperX CPU fails capacity/quality targets, report model size, memory, load time, and runtime before choosing between tuning, a different approved execution environment, or a different approved transcription service.

## 7. What this prototype must produce

- Minimal runnable source with pinned dependency versions and setup instructions.
- Environment-variable template containing names only, never credentials.
- Real private sample outputs and a report of measured pipeline performance.
- Tests for duration/frame rules, owner isolation, job dispatch/replay, and output finalization.
- A failure/recovery matrix showing which scenarios were actually exercised.
- A short architecture decision update: validated choices, failed assumptions, and changes needing approval.

These are future deliverables. This document is the plan, not evidence that the prototype exists.

## 8. Implementation milestones after validation

1. **Private foundation:** Production-ready auth/recovery, ownership, uploads, and operational configuration.
2. **Generation core:** Both pipelines, full approved template set, quality checks, immutable final library, and resource cleanup.
3. **Four-step product UI:** Home/My Videos and simple creation flow; no video editor.
4. **Publishing/calendar:** Both real integrations, declarations, scheduling, independent state, and recovery.
5. **Pilot/release:** PRD A01–A28, edge-case verification, real media quality and capacity measurements, and owner demonstration.

Do not treat an attractive interface, download-only prototype, or mocked scheduler as completion of V1. The PRD Definition of Done remains the release gate.
