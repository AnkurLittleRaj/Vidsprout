# VidSprout.ai — V1 Product Requirements Document

**Status:** Draft for review; not an implementation or purchase authorization  
**Prepared:** 19 October 2026  
**Updated:** 22 October 2026 — revision 6  
**Audience:** Educators and content creators  
**Product name:** VidSprout.ai  
**Tagline:** Your ideas. Your voice. Your videos.  
**Naming status:** VidSprout.ai is the user-approved project name. Domain registration and trademark clearance remain separate launch checks; no domain has been purchased.

**Companion design documents:** [System architecture and generation pipelines](./SYSTEM-ARCHITECTURE-V1.md) · [Technical prototype plan](./PROTOTYPE-PLAN-V1.md). These describe proposed implementation and validation; they do not change the agreed V1 feature scope or certify implementation.

## 1. Product objective

Help educators and content creators turn a topic, teaching notes, or their own narration into a short video with synchronized visuals, motion graphics, and captions. Users can download the finished video or publish/schedule it for Instagram and YouTube.

The primary promise is: **“Upload your voice, get an animated video.”** Topic-to-video with AI voiceover is an equally supported entry path.

The creation experience has exactly four top-level steps. AI determines an appropriate duration; users do not have to select a length. Every finished video is at most 90 seconds. Vertical 9:16 is the default; landscape 16:9 is optional.

### 1.1 Confirmed product decisions

- VidSprout.ai is an individual-account product. Each person sees only their own profile, inputs, videos, assets, jobs, and publishing calendar.
- No shared workspace, project sharing, public profile, public video gallery, collaboration, or share-link feature is included.
- V1 serves educators and content creators, not a separate enterprise or brand workflow.
- Motion graphics, visual stories, and mixed styles are included.
- English is the only V1 language.
- Original uploaded narration is preserved. There is no trimming or audio editor.
- The generated video is final: no scene, script, transcript, caption, audio, or visual editor and no creative regeneration controls.
- AI chooses templates, scenes, pacing, and duration. Vertical/landscape remains a pre-generation choice.
- ElevenLabs remains the preferred AI voiceover provider, but the requirement to use free tools leaves commercial deployment unresolved; no paid plan is authorized.
- Frontend: Next.js. Application backend: Node.js. Database: MongoDB. Application deployment: Vercel.
- Authentication: Better Auth with MongoDB adapter. Persisted media/assets: Cloudflare R2. Background workflows/scheduling: Inngest (interpreting the user's “Ingest”). Animation: Remotion; rendering compute: Vercel Sandbox.
- Registration collects name, email address, and password; sign-in uses email and password, not magic links or email OTP.
- Captions, scene changes, and important animations follow the actual voiceover timing.
- Users preview and approve the finished video before publishing or scheduling.
- Instagram and YouTube have independent publishing outcomes.
- No brand kit, saved logos, brand fonts/colors, brand-tone settings, or promotional brand workflow.
- No customer billing, subscriptions, credit balances, pricing screens, or usage dashboard.

### 1.2 Proposed implementation defaults

Details not explicitly decided in the discussion are labeled **proposed** in this document. These provide a concrete basis for design and engineering review, rather than implying prior user approval.

Registration and private project ownership are confirmed requirements. V1 has no teams, invitations, roles console, or user administration dashboard. Signup/sign-in happen before the dashboard and do not add steps to video creation. Commercial launch, Remotion eligibility, voice selection, and transcription compute remain open; authentication, storage, orchestration, and rendering providers are selected.

## 2. Users, needs, and examples

| User | Need | Example result |
|---|---|---|
| Educator | Explain a concept without editing a timeline | Notes about evaporation become a concise narrated animation with labeled stages |
| Educator with recorded narration | Preserve their teaching style | A 52-second recording becomes an approximately 52-second animated lesson |
| Content creator | Produce useful short-form content consistently | “Three study habits” becomes a short list video with synchronized numbered points |
| Creator publishing across channels | Avoid repeating production and upload work | One approved video has separate YouTube metadata and Instagram caption/schedule |

Example durations are illustrative, never prescribed template lengths. A simple definition may need 18 seconds; a fuller explanation may need 47 seconds. The product must not stretch content to 90 seconds.

### 2.1 Goals and measurement

Measure the following internally, without exposing a usage dashboard:

- Completion rate from content submission to an approved video.
- Time from generation request to playable preview, including queue time.
- Percentage of final videos accepted for download/publication and reasons for discarding them.
- Percentage of generated videos downloaded or approved for publication.
- Return creation rate among pilot participants.
- Generation success, synchronization defects, and publishing success per platform.
- Actual provider/rendering expense per approved video for operating decisions.

No commercial conversion or subscription metrics are V1 requirements. Internal operational telemetry is not customer usage/billing functionality.

## 3. Scope

### 3.1 Included

Name/email/password registration; ideas; topic/notes entry; uploaded narration; internally generated scripts/transcripts; AI voiceover; automatic duration planning; AI-selected template-based motion graphics, stock visuals, and mixed scenes; synchronized captions; automatically balanced licensed music when suitable; pre-generation vertical/landscape choice; input draft autosave; final-video library; MP4 download; social connections; platform metadata; publish now; scheduling; per-platform status and technical failure recovery.

### 3.2 Excluded

- Billing, subscriptions, generation-credit display, and user-management screens.
- Branding controls, brand kits, custom logos, and brand-specific templates.
- Voice cloning, avatars, lip synchronization, or face replacement.
- All generated-video editing/customization, including script/transcript editors, scene replacement, caption changes, timing adjustments, creative regeneration, and custom keyframes.
- User-uploaded visual assets are proposed to be deferred to keep V1 input limited to topics/notes and narration; confirm this simplification before implementation.
- Photorealistic text-to-video generation as a core dependency.
- Long-form video generation beyond 90 seconds per output.
- Automatic content creation and publication without approval.
- Recurring campaigns, automated series publishing, and multi-user approvals.
- Advanced social engagement analytics, trend scraping, and other social networks.
- Website scraping, PDF import, slide import, and video-to-video repurposing.
- Cross-user video access, project invitations, public profiles, public galleries, and public/unlisted in-app video share links.

A recording over 90 seconds must be shortened outside the product and uploaded again. No in-product trim, split, or series editor is included. Technical retries are allowed for failed jobs; they are not creative revision of a successful final video.

## 4. Information architecture and dashboard requirements

The navigation contains **Home, My Videos, and Calendar**. The creation flow opens within this structure. No separate script, audio, rendering, or export wizard is added.

Every dashboard section is scoped to the signed-in person's account, including counts, search results, thumbnails, recent items, notifications, and calendar entries. The account menu contains a private personal profile with name and email; there is no discoverable profile page or list of other users. Signing out and switching accounts must clear account-specific client state and cached previews before displaying the next account.

### 4.1 Home

- Primary action: **Create video**.
- Entry options: **Use a topic or notes**, **Suggest ideas**, **Upload your voice**.
- Recent drafts show title, thumbnail if available, last edit, and Resume.
- Upcoming posts show platform, destination, local date/time, and status.
- Suggested ideas reflect optional topic/audience preferences; preferences are not mandatory onboarding.
- Action-needed cards show failed generation, disconnected accounts, or missed posts with a direct recovery action.
- Empty state gives a brief explanation and an example topic, without requiring setup or social connection.
- A provider outage shows a clear status and keeps saved projects available.

### 4.2 My Videos

- Grid/list of projects with title, thumbnail, format, final duration when available, last update, and creation status.
- Search by title; filters for draft, generating, ready, and needs attention. Publishing badges are separate.
- Actions: Resume unfinished input, Watch, Download, Publish/Schedule, Delete, and Retry a failed job.
- Project detail shows the final video, duration, format, and platform post records; no scene cards or editor.
- Creating another video starts a separate input flow and does not alter a completed video or its posts.
- Delete lists affected pending posts and requires confirmation. It first cancels or reconciles pending external actions; it must not claim that a live social post is deleted.
- A project can be ready while Instagram is failed and YouTube is published; never flatten these into one misleading status.

### 4.3 Calendar

- Proposed views: month and chronological agenda, with timezone always visible.
- Each platform post has its own entry or clearly separated row under a grouped video.
- Entries show video title, platform, destination, scheduled time, status, and action-needed state.
- View, reschedule, cancel, and inspect errors without opening a separate creation workflow.
- Creating a calendar entry selects an already approved render; drafts link to completion in Step 3.
- Published entries show platform URL and confirmed publication time when available.
- Missed/failed events remain visible at their original planned time, with recovery actions.
- Avoid color-only distinctions; use text and icons.

### 4.4 Account access and publishing connections

- No Settings page or settings icon in the user navigation. A compact account menu provides name, email identity, password-change access, sign-out, and data-deletion access. English is fixed for V1.
- Connect Instagram and YouTube within the publishing flow: identity, eligibility, connection state, reconnect/disconnect. Timezone selection belongs in scheduling.
- Proposed V1 limit: one Instagram destination and one YouTube channel per account.
- Changing a destination does not silently retarget already scheduled posts.
- No brand kit, payment information, credit meter, or subscription controls.
- Data deletion and sign-out are accessible without a user-management dashboard.

### 4.5 Shared interaction requirements

- Infrastructure is managed by the SaaS operator, never by end users. Do not expose R2, Better Auth, MongoDB, Vercel Sandbox, Inngest, environment variables, provider keys, or live-render enablement controls/status panels in the dashboard or account menu. Users create, watch, download, schedule, and publish videos; they only authorize their own YouTube/Instagram connections in the publishing flow.
- Service failures show plain-language availability or recovery messages. Users must never be asked to configure infrastructure. Provider diagnostics remain in server-side logs and operator tooling.

- Plain language; no provider names, job IDs, or technical error dumps in the normal workflow.
- Autosave with visible Saving/Saved/Unable to save states. Proposed debounce: two seconds after editing stops.
- Browser refresh or navigation must recover the latest server-saved project and active job.
- Keyboard-accessible controls, labeled inputs, visible focus, accessible error announcements, and captions in previews.
- Proposed target: WCAG 2.2 AA for core screens. Responsive layouts must support narrow screens without hiding recovery actions.
- Progress uses actual stages; no invented percentages or guaranteed completion time.

### 4.6 Registration and password sign-in

- Signup collects name, email address, and password; successful registration opens the dashboard.
- Use Better Auth's email/password capability and official MongoDB adapter for credentials and sessions; use its supported schema/indexes rather than a separate custom credential store. [S14]
- Login uses email and password. No magic links, email OTP, or mandatory email-verification step is included in the agreed login flow.
- Use an immutable internal account ID and a unique normalized email lookup, without provider-specific dot/plus rewriting. Unverified email ownership must not grant access to another identity or automatically link social accounts.
- Use Better Auth's maintained password hashing/verification implementation with settings validated for the pinned version. Never store/log plaintext passwords or introduce custom cryptography. The earlier proposed Argon2id override is not required.
- Proposed password policy: minimum 12 characters, allow long passphrases and password managers, never silently truncate.
- Rate-limit signup/login attempts, return generic invalid-login errors, and prevent duplicate account creation with a database unique index.
- Use secure HttpOnly session cookies, session rotation on login, logout invalidation, and CSRF protection appropriate to the authentication library.
- Password changes require the current password or a verified recovery flow; invalidate other sessions after recovery.
- Password recovery remains undecided. A single-use, short-lived emailed reset link is proposed and distinct from email-based login; it is not yet a confirmed feature/vendor choice. Do not implement insecure recovery through name/email knowledge alone.
- Session expiry preserves saved inputs and prompts login before protected actions. Account deletion also cancels pending jobs/posts according to the cleanup pipeline.

## 5. Four-step creation experience

### Step 1 — Add content

**Inputs:** English topic, pasted notes, AI idea selection, or uploaded English audio. Optional audience level refines the result.

**Behavior:**

- Offer a small set of idea cards containing topic, hook, and suggested treatment; choosing one populates the project.
- Validate content before processing. Empty or vague prompts receive a focused suggestion within this step.
- Proposed input limits: 5,000 characters for topic/notes; MP3, WAV, or M4A narration up to 25 MB and 90 seconds. Validate file signatures and decodability.
- Visual asset selection is automatic; user visual uploads are proposed to be deferred.
- Show upload progress and retry without losing entered notes.
- Audio is transcribed internally. Unreliable transcription requires a clearer recording rather than a transcript editor.
- Narration over 90 seconds is rejected with a request for a shorter recording. Do not silently trim, compress, or replace the speaker.

**Exit:** usable English content or a valid recording that can fit the output cap.

### Step 2 — Confirm basic options

**Controls:** vertical/landscape and narration mode. Proposed: a small AI voice selector before generation, pending confirmation. No template, script, transcript, caption, or music customization.

- Default to vertical 9:16. AI selects a suitable visual style/template and pacing.
- Proposed initial template set: concept explainer, numbered tips, step-by-step lesson, quote/key takeaway, and fact/statistic.
- Templates include both orientations and a tested range of text lengths.
- No brand customization. Template palettes/fonts may be intrinsic to the selected design.
- Topic input produces an internal script and scene outline, not editing screens. An estimated duration may be shown as an estimate.
- Uploaded audio retains its original narration; transcription supports generation only.
- AI voices use a curated set of permitted English voices. Voice cloning is absent; whether users select a voice or receive a default remains open.
- Preview samples should be cached where permitted; do not generate new paid audio on every selection.
- No Shorten, Simplify, Try another opening, or duration-selection controls. Users can revise their original inputs before submission.
- Facts/numbers from notes must not be invented or altered for visual impact. Block unsupported numerical claims or request clearer source input; no claim of automatic fact verification.

**Exit:** original input and basic options submitted for generation. This is not publication approval.

### Step 3 — Generate and watch the final video

- Show queue, voice/transcription, scene preparation, rendering, and final checking stages as applicable.
- Generate a full playable preview using the same final artifact that will be approved/exported.
- Display actual duration, aspect ratio, and caption state.
- The successful video is immutable; users can watch, accept, download, publish/schedule, or discard it.
- No editor, scene controls, caption toggles, audio replacement, or creative regeneration is exposed.
- Orientation is locked after submission. A different orientation requires a separate new creation, not modification of the final video.
- Internal quality checks and bounded automatic repair run before a successful final result is presented.
- Failed technical jobs can be retried. A factual/content concern can be reported or discarded; it must not trigger automatic publication.
- User action **Approve video and continue** records the exact render version/checksum.

**Exit:** verified render approved by the owner.

### Step 4 — Download, publish, or schedule

- Download works without a social connection.
- Select Instagram, YouTube, or both; display exact destination identities.
- Connect accounts inline if necessary, returning to this step after authorization.
- Generate editable Instagram caption and YouTube title/description separately.
- Collect required platform fields, including YouTube audience and applicable synthetic-media disclosure. Educational content alone must not automatically mean “made for kids.”
- Show actual format compatibility. Landscape download remains supported; if a destination cannot accept it, offer another destination or a separate new vertical creation, never modification or silent cropping of the final video.
- Choose Publish now or a future date/time independently for each destination. Proposed initial scheduling window: at least 15 minutes ahead and at most 30 days ahead; validate against processing capacity.
- Publication titles/descriptions/captions and scheduling controls are separate from audiovisual customization; they remain editable before posting.
- Final summary displays thumbnail, approved version, destination, metadata, timezone, and planned action.
- Final confirmation authorizes those specific posts; retries must not create a new authorization or duplicate successful posts.

**Exit:** file download and/or independent post records created. Pending is not published.

## 6. Duration, timing, and output contract

### 6.1 Duration rules

- Hard ceiling: final video stream and audible track must not exceed **90.000 seconds**.
- AI chooses script length for clarity and natural pacing. Estimates use language/voice characteristics; actual measured audio is authoritative.
- Proposed normal target: concise content between roughly 10 and 90 seconds, but no artificial ten-second product minimum. Very short valid content is allowed where the destination supports it.
- Reserve any title/closing time within the ceiling. Remove unnecessary closing padding before proposing content cuts.
- If AI audio exceeds the cap, automatically shorten the internal script and regenerate before presenting the final result. Proposed limit: two attempts, then request a narrower topic. Never alter uploaded narration this way.
- Never truncate mid-sentence or silently accelerate narration.
- Exact-boundary inputs must account for frame rounding, audio padding, and encoder duration. Use deterministic frame accounting and inspect the encoded output, not just the script estimate.

### 6.2 Synchronization contract

- Audio is the master timeline; word/phrase spans are mapped to scene events.
- ElevenLabs character timing is converted to words/phrases, accounting for normalized spoken text such as numbers. [S1]
- Uploaded audio uses WhisperX transcription and forced alignment; language-specific alignment support must be validated. [S4]
- Caption text, spoken text, and visual headings are separate fields. A short heading does not rewrite speech.
- Store timestamps in milliseconds and derive render frames consistently. Avoid cumulative rounding drift.
- Detect missing, non-monotonic, negative, overlapping-invalid, or out-of-range timestamps.
- When word alignment is unreliable, fall back to phrase captions without word highlighting; flag affected passages for preview. Do not fabricate precise timings.
- Proposed QA target: at least 95% of annotated caption/visual cue onsets within 250 ms on the approved clean-speech test set. No silent acceptance of sustained end-to-end drift over 500 ms.
- These are release targets to measure, not claims of perfect synchronization for all accents or recordings.

### 6.3 Render defaults

- Proposed prototype export: MP4, H.264 video, AAC audio, 30 fps, 720×1280 vertical or 1280×720 landscape. Evaluate 1080p after benchmarking; resolution is not a customization control.
- Final codec/bitrate settings must satisfy current platform requirements and the selected FFmpeg build/license.
- Captions are automatically included without an editing toggle. Keep text readable inside platform-safe areas and away from important visual content.
- Optional music ducks under narration. Proposed audio target: approximately -16 LUFS integrated and no clipping; validate intelligibility rather than relying solely on loudness numbers.
- No automatic logo, brand outro, or product watermark requirement.
- Empty/black frames, missing assets, clipped text, corrupted audio, and excessive output duration block approval.

## 7. System pipelines

Confirmed architecture: Next.js frontend and Node.js APIs on Vercel; Better Auth with MongoDB for authentication; MongoDB for project/job/post metadata; private Cloudflare R2 for all persisted video, audio, images, thumbnails, and generated asset files; Inngest for durable background workflows and scheduled publication; Remotion executing in Vercel Sandbox for rendering. [S14–S18]

Inngest orchestrates work and retries; it does not replace rendering compute or storage. Vercel Sandbox is ephemeral rendering compute, not persistent media hosting. R2 is the durable media source of truth. Accepted jobs continue independently of browser closure. Browser/local rendering is no longer the selected deployment strategy.

WhisperX still requires a validated Python execution environment. A separate CPU Sandbox task is a candidate to benchmark, not a confirmed performance guarantee or GPU assumption. Node.js remains the application backend.

### 7.0 Service integration contract

- Better Auth protects application routes; each job/asset request checks the authenticated owner. Social publishing OAuth connections remain distinct from application login.
- Derive owner IDs from the verified Better Auth session, never from a client-supplied owner field. Scope every resource lookup and mutation to that owner; opaque/random IDs do not replace authorization.
- Upload directly to private R2 through short-lived scoped signed URLs issued after authorization. Validate uploaded size/type/checksum before processing; configure CORS for application origins. Never expose bucket credentials.
- MongoDB stores object keys/metadata, not media bytes or permanent signed URLs. Mint fresh access URLs when needed.
- Persist job/post intent before dispatching an Inngest event. Use a transactional outbox or reconciliation mechanism for the database/event-delivery gap, with deduplicated intent/event IDs.
- Inngest events carry IDs and small metadata, not media bytes, passwords, provider tokens, or long-lived access URLs.
- Split work into durable stages. Start Sandbox rendering in a bounded step, persist Sandbox/render IDs, and poll or handle authenticated completion in subsequent steps. Do not hold a Next.js request open for the entire render.
- Sandbox reads authorized R2 inputs, runs a pinned Remotion/template build and required media tools, validates the result, and uploads final media/thumbnail to R2 before termination.
- Mark success only after R2 upload, checksum/media checks, and database finalization. A Sandbox-local artifact is not a completed deliverable.
- Release Sandbox resources on success, failure, timeout, and cancellation; reconcile abandoned instances. Attempt-specific temporary R2 keys prevent retries overwriting an immutable final artifact.
- Inngest retries do not guarantee exactly-once external effects. Check database state/provider IDs before repeating Sandbox creation, speech generation, or publishing.

### 7.1 Pipeline A — Topic/notes to video

1. Authenticate ownership, validate input, create project revision, and persist source text.
2. Request structured script and scene outline from Gemini; treat source text as content, not executable instructions.
3. Validate schema, supported templates, content completeness, and duration estimate. Reject arbitrary generated code/URLs.
4. Confirm basic options in Step 2 and record generation consent; script/template selection stays internal.
5. Call ElevenLabs with the selected supported voice/model; store audio, provider request ID, spoken-text normalization, and alignment.
6. Inspect actual audio duration; apply bounded internal shortening/repair under section 6 before presenting a successful video.
7. Build scene events from phrase timestamps; select permitted stock assets or template illustrations.
8. Inngest starts Remotion in Vercel Sandbox; mix/export using FFmpeg and persist validated media to R2.
9. Validate final duration, streams, layout, assets, and synchronization; retain QA results with render version.
10. Show preview; after explicit approval, make the immutable render available to Step 4.

### 7.2 Pipeline B — Uploaded voice to animation

1. Issue a scoped R2 upload URL; validate the resulting object and decode in an isolated processing environment.
2. Store original unchanged; create a normalized processing copy with an explicit time-offset mapping.
3. Detect duration and speech. Silence, overlapping speakers, and severe noise receive a recoverable warning or block.
4. If over 90 seconds, reject and request a shorter recording; no segment selector.
5. Transcribe and align internally with WhisperX. Block unreliable output and ask for a clearer recording; no transcript editor.
6. Ask Gemini for scene suggestions without rewriting the original narration.
7. Build animation/caption timing, render, validate, and preview as in Pipeline A.
8. Retain original audio, processed copy, and internal transcript until deletion.

### 7.3 Pipeline C — Technical recovery and final-output immutability

- Every job snapshots an immutable input revision and records a dependency fingerprint.
- Internal automatic repairs can rebuild invalid timing/layout before success; they are not user editing features.
- A failed job resumes from safe stages where possible without duplicate provider calls.
- Once successful, audiovisual content is locked. No update endpoint or UI can change it.
- A separate creation has a new project/job identity and no inherited publication approval.
- A stale worker may finish, but cannot overwrite a newer draft or become approved automatically.
- Cancel requests stop new stages and mark results discarded if a provider cannot cancel an in-flight request.
- Provider requests that time out after submission are reconciled where possible; never retry unlimited paid generations blindly.

### 7.4 Pipeline D — Publish now

1. Verify owner, render approval/checksum, active connection, metadata, required declarations, and destination compatibility.
2. Persist one post intent per platform with an idempotency key and immutable render/metadata snapshot.
3. Acquire a worker lease; preflight credentials and quota; submit upload/container creation.
4. Persist provider IDs as soon as received; wait for platform processing readiness.
5. Execute publish/visibility change only for the confirmed intent.
6. Reconcile provider state and record the live URL/time when confirmed.
7. Notify in-app of success, failure, partial success, or action required.

YouTube uploads can require additional processing; an upload response alone is not publication success. Its API exposes processing and scheduling-related fields. [S8, S9]

### 7.5 Pipeline E — Scheduled publishing

- Store scheduled instant in UTC and the selected IANA timezone, local date/time, and offset used at confirmation.
- Inngest owns scheduled execution; MongoDB holds the authoritative post time/revision. Use durable delayed execution such as sleepUntil, with separate preparation and due-time publication stages. No Vercel Hobby cron dependency. Upload/process ahead where feasible, keeping content private/unpublished until the due time. [S16]
- Reschedule/cancel emits a cancellation/update event and updates the database revision. A waking old workflow must recheck revision/state before any external effect; event cancellation alone is insufficient.
- For YouTube, use private pre-upload and a final visibility update. Native publishAt can be an alternative after integration validation, but do not use both mechanisms for the same post.
- Instagram media preparation must occur within current container validity limits, not weeks in advance. Query current readiness and rebuild expired containers where appropriate. Validate exact limits against the selected API version before launch. [S10]
- Use persistent jobs, leases, heartbeat/recovery, and a database compare-and-set transition to prevent parallel publication.
- Proposed retry policy for clearly transient errors: exponential backoff with jitter, up to five attempts, constrained by a 15-minute post-due grace window. Honor Retry-After and quota windows.
- If the provider's outcome is unknown, reconcile first. If no reliable duplicate check is possible, pause for user action rather than risk a duplicate.
- Past the grace window, mark Missed/Needs action and offer Publish now or Reschedule. Never post hours late silently.
- Rescheduling increments a schedule revision; stale queued tasks must fail their revision check.
- Cancel before submission prevents publication. If publication may already have occurred, reconcile and report the real result; cancellation is not guaranteed deletion.
- Connection loss blocks the affected destination only. Reconnection does not authorize late publication automatically.

### 7.6 Pipeline F — Cleanup and deletion

- Deletion creates a tombstone that workers check before saving/rendering/publishing.
- Pending posts are canceled and in-flight external effects reconciled before reporting cleanup complete.
- Proposed policy: failed temporary artifacts expire after seven days; canceled transient uploads within 24 hours; user-requested deletion from active storage within seven days, backups within 30 days.
- Approved assets remain available while referenced by an active schedule. Cleanup cannot break a valid scheduled post.
- Inngest cleanup workflows delete eligible R2 objects and abandoned multipart uploads. R2 lifecycle rules must not expire assets still referenced by schedules. Sandbox temporary files are never counted as durable storage or backups.
- Deleting a project does not delete an already published social post; explain and link to that post.
- Disconnecting an account revokes/removes credentials and blocks pending posts for it. It does not affect downloaded files or published posts.

## 8. State model and data requirements

### 8.1 Independent states

| Object | States |
|---|---|
| Project | Draft, Generating, Ready for review, Approved, Needs attention, Deleted |
| Generation job | Queued, Running (stage), Retry waiting, Succeeded, Failed, Cancel requested, Canceled |
| Connection | Connected, Expiring/reconnect needed, Permission missing, Disconnected |
| Platform post | Scheduled, Preparing, Uploading, Processing, Ready to publish, Publishing, Published, Retry waiting, Needs action, Failed, Missed, Cancel requested, Canceled |

Terminal states may only change through explicit new actions or verified provider reconciliation. “Failed” is not equivalent to “definitely not published” after a network timeout; use Needs action with an unknown-outcome reason.

### 8.2 Minimum persisted records

| Record | Required information |
|---|---|
| Account | Immutable owner ID, name, unique normalized email, password hash, fixed English locale, timezone, session/recovery references; no billing fields |
| Project/revision | Owner, input type, source reference, script/transcript, style, language, aspect ratio, revision |
| Asset | Owner, source, storage key, checksum, MIME/codec, duration/dimensions, rights/attribution metadata |
| Narration | Source mode, original audio reference, normalized spoken text, voice/model, timing map; no user-edited segment |
| Scene | Template/version, start/end, phrase anchors, text, asset references, animation parameters |
| Render | Input revision, checksum, media properties, QA outcome, artifact location, approval actor/time |
| Job | Stage, idempotency key, input fingerprint, attempts, lease, provider request IDs, sanitized error |
| Connection | Platform/account ID, encrypted tokens, scopes, expiry, connection state |
| Post intent | Render/version, destination, metadata, declarations, schedule/timezone, revision, approval, idempotency key |
| Post attempt/event | Provider IDs, transitions, timestamps, error category, reconciliation result, public URL |

Approvals bind to the immutable final render. A scheduled video's audiovisual content cannot be edited or replaced. Metadata/schedule changes update only the post-intent revision and require confirmation. A different video requires a new project/post and cancellation of the old pending intent if desired. In-flight actions must be reconciled before conflicting changes.

## 9. Tools, licenses, and external dependencies

| Component | V1 recommendation | Dependency/constraint |
|---|---|---|
| Writing/planning | Gemini API | Free tiers can support development but have quotas and data-use conditions. Validate model availability; keep adapter replaceable. [S3] |
| AI voiceover | ElevenLabs preferred; Flash v2.5 proposed for evaluation | Free plan is limited to eligible non-commercial use, not a free commercial SaaS engine. Model/voice/timestamp availability must be tested. Commercial intent plus zero-paid-services is unresolved; self-hosted Kokoro is an alternative for approval, not an automatic substitution. [S1, S2] |
| Transcription/alignment | WhisperX | Self-hosted compute required; validate licenses for chosen alignment weights and each supported language. [S4] |
| Animation/render | Remotion in Vercel Sandbox | Selected rendering architecture; validate Sandbox capacity/quotas and Remotion license eligibility separately. [S5, S17, S18] |
| Media export | FFmpeg | Review selected build/components and codecs before distribution/deployment. [S6] |
| Stock assets | Pexels API | Attribution, rights restrictions, rate limits, availability, and permitted integration behavior apply. Store provenance. [S7] |
| Background music | Small curated licensed collection | Verify exported-user-video rights per track; no unlicensed or generative-music dependency |
| Publishing | Official Instagram and YouTube APIs | OAuth, permissions, account eligibility, quota, review requirements, media validation, and versioned platform behavior |
| Frontend/application APIs | Next.js and Node.js | Confirmed application stack |
| Database | MongoDB; Atlas free tier proposed | Store metadata, password hashes, jobs, and schedules; no media blobs. Quotas/capacity need validation |
| Application hosting | Vercel | Confirmed preference; Hobby is for personal/non-commercial use. Commercial launch needs an eligible hosting plan or an approved change. [S11] |
| Workflows/scheduling | Inngest | Selected for generation orchestration, retries, cleanup, and delayed publishing; validate free-tier allowances, concurrency, and wait limits. [S16] |
| Authentication | Better Auth with MongoDB adapter | Name/email/password registration; no magic-link/email-OTP login; recovery delivery remains open. [S14] |
| Media/asset storage | Cloudflare R2 Standard | All durable media; private buckets and signed access. Free allowance is bounded; enforce capacity safeguards before accepting more work. [S15] |

The user's requirement is to use free tools and avoid paid services for V1. No paid service may be assumed or purchased from this document. Free software still needs compute/storage, and free plans have eligibility/usage restrictions. The exact combination of free Vercel, free ElevenLabs, commercial use, and always-available generation/scheduling is not established as feasible. Resolve this explicitly before launch; do not disguise paid dependencies or quietly remove publishing requirements. Lack of a billing screen does not make the service non-commercial.

The free Gemini tier is proposed for non-sensitive development data. Production use of private recordings/transcripts requires a suitable data-handling configuration or alternate approved provider; do not promise that all provider plans offer zero retention.

## 10. Edge cases and required behavior

| ID | Situation | Required behavior |
|---|---|---|
| E01 | Blank topic or empty notes | Explain missing input; keep user in Step 1 |
| E02 | Very broad lesson | Suggest a focused angle that fits 90 seconds; do not omit essential context invisibly |
| E03 | Huge pasted input | Apply a documented input cap; show selection/shortening options, never silent truncation |
| E04 | File extension disagrees with contents | Reject based on actual file inspection |
| E05 | Upload interrupted | Retain draft; retry upload; expire orphaned partial objects |
| E06 | Corrupt, protected, unsupported codec | Explain accepted formats and preserve other inputs |
| E07 | Silent, music-only, or near-empty recording | Do not hallucinate narration; request another recording |
| E08 | Noise, accent, overlapping speakers | Flag unreliable processing and request a clearer recording; no transcript editor |
| E09 | Non-English or unsupported code-switching | Explain English-only V1 and request English input; never translate an uploaded voice silently |
| E10 | Recording exceeds 90 seconds | Request a shorter uploaded recording; no in-app trim/split |
| E11 | Exactly 90-second source encodes over cap | Handle non-content encoder padding without cutting speech; if still invalid, request a shorter source |
| E12 | Internal transcript disagrees with speech | Block unreliable generation and ask for clearer input; no user caption/transcript editing |
| E13 | Scientific term, name, number mispronounced | Apply bounded internal pronunciation QA before finalization; user may report/discard a bad final result, not edit its audio |
| E14 | Unsupported/missing timestamp tokens | Phrase-level fallback, flagged preview, no fabricated word precision |
| E15 | AI invents statistics or examples | Keep user sources distinguishable; require review; do not invent numeric chart values |
| E16 | Prompt injection in notes/transcript | Treat as data; schema-validate model output; no tool, code, or secret access from content |
| E17 | Output blocked by provider policy | Explain actionable failure; preserve allowed draft content; no bypass routing |
| E18 | Selected voice removed or unavailable | Ask for another voice; never silently change the speaker |
| E19 | No suitable stock footage | Automatically use a suitable template illustration before finalization or fail clearly |
| E20 | Missing attribution/asset rights | Block that asset and offer a replacement |
| E21 | Text overflows or diagram cropped | Automatically reflow within readable bounds before success; block invalid render instead of asking user to edit |
| E22 | Landscape incompatible with destination | Retain download/compatible destinations; separate new vertical creation is possible, not editing the final video |
| E23 | Music overpowers voice | Automatically rebalance or omit music before finalization; no audio controls |
| E24 | Rate limit/provider outage | Queue/retry boundedly; show stage/recovery; no fake success |
| E25 | Browser closes during generation | Accepted Inngest/Sandbox job continues; reconnect reads persisted status from MongoDB |
| E26 | Double-click Generate/Publish | Reuse same idempotent intent; avoid duplicate jobs/posts |
| E27 | Two tabs change draft inputs | Detect conflict before submission; freeze the accepted generation snapshot |
| E28 | Old job finishes after cancellation/new creation | Do not overwrite another project's final output or revive canceled intent |
| E29 | Technical retry fails | Preserve source inputs and diagnostics; offer bounded retry, not an editor |
| E30 | Render exceeds resource/time limit | Fail boundedly, preserve inputs, retry with safe internal resource settings |
| E31 | Token expires/revoked or permission lost | Block only affected platform, reconnect, and revalidate intent |
| E32 | Wrong/ineligible Instagram account | Explain professional-account requirement and retain download option |
| E33 | YouTube channel/account unavailable | Show exact destination issue; reconnect/select eligible channel |
| E34 | One platform succeeds, other fails | Show Partial success; retry only failed destination |
| E35 | Provider accepts post but response is lost | Reconcile using recorded IDs/state; avoid blind duplicate submission |
| E36 | Platform processing/rejection after upload | Keep Processing or Failed; no Published badge without confirmation |
| E37 | Asset URL expires during platform fetch | Renew/recreate safely before retry; do not expose permanent public storage |
| E38 | Scheduled time is in the past | Require Publish now or a new future time |
| E39 | DST time is ambiguous/nonexistent | Ask user to select a valid time/offset; display timezone |
| E40 | Account timezone changes | Preserve already-confirmed UTC instant and show new local representation |
| E41 | Scheduler outage misses due time | Apply grace window; then Missed with explicit recovery, not silent late post |
| E42 | Cancel/reschedule races with publishing | Revision/lease checks plus provider reconciliation; accurately report already-published results |
| E43 | Attempt to edit/replace scheduled video | Deny audiovisual mutation; new video requires a separate project/post; allow explicit schedule/metadata updates only |
| E44 | Project deleted with pending posts | Cancel/reconcile posts before cleanup; disclose published posts remain live |
| E45 | Account disconnected with future posts | Block associated posts; no retargeting or auto-late publication |
| E46 | Metadata invalid or too long | Validate per platform and highlight field; do not silently truncate |
| E47 | YouTube audience/disclosure omitted | Require relevant declarations before upload/publish |
| E48 | Social platform changes requirements | Versioned preflight rejects affected publication; export still available |
| E49 | User deletes published video on platform | Reconcile when possible; distinguish previously published from currently unavailable |
| E50 | User attempts another owner's asset/job URL | Deny access at every API/storage boundary |
| E51 | Duplicate email or concurrent signup | Unique database constraint prevents duplicate identities; provide safe sign-in/recovery guidance |
| E52 | Incorrect password or brute-force attempts | Generic error, bounded rate limiting, no account data exposure |
| E53 | Session expires during upload/generation | Keep persisted inputs/job; require reauthentication to access result or publish |
| E54 | Forgotten password | Use only the validated recovery method; no reset based solely on knowing name/email |
| E55 | Free provider quota exhausted | Pause/retry within quota or show unavailable; no automatic paid upgrade or unlimited retry |
| E56 | Sandbox unavailable or timed out | Persist attempt state, reconcile existing instance, retry boundedly; never mark local-only output successful |
| E57 | Generated video is unwanted but technically valid | Allow discard or separate new creation; no editing/creative regenerate controls |
| E58 | Render finishes but R2 upload fails | Keep job incomplete; recover/retry upload if Sandbox survives, otherwise rerender safely; never expose a missing artifact |
| E59 | Duplicate Inngest delivery or replay | Reuse intent/attempt IDs and inspect provider state before repeating external side effects |
| E60 | R2 signed URL expires during rendering/publishing | Issue fresh scoped access; retain stable object identity and avoid permanent public bucket access |
| E61 | Sandbox terminates after upload before database update | Reconcile attempt-specific R2 artifact/checksum before restarting expensive rendering |
| E62 | R2 or Inngest allowance reached | Stop accepting affected work with a clear status; retain existing valid outputs; do not authorize paid overages implicitly |

## 11. Reliability, privacy, and operations

### 11.0 Private individual workspaces

- Private means other VidSprout.ai users cannot discover or access another person's data. It does not mean media never reaches the selected processing/storage providers; disclose provider processing accurately.
- Enforce ownership for list/search, detail, thumbnail, stream/range, download, upload completion, retry, delete, generation status, and publishing endpoints. Return safe not-found/denied responses without revealing another account's resource metadata.
- Jobs and callbacks must resolve ownership from trusted persisted job records. Verify event signatures and resource associations; never trust an arbitrary owner ID in a callback payload.
- Keep R2 buckets private. For normal viewing/download, prefer an authenticated media gateway that authorizes each request (including byte ranges). If short-lived signed URLs are used, treat them as bearer credentials: anyone holding a valid URL can use it until expiry. They are not product share links or a guarantee against deliberate redistribution. Never expose long-lived public media URLs.
- Use narrowly scoped, expiring access for Sandbox processing and platform ingestion. Keep credentials and media URLs out of public logs, analytics, error reports, and referrers.
- Cache keys and realtime/job status subscriptions must include the account boundary; private responses must not enter a shared public cache. Logout/account switching clears private UI caches.
- There is no cross-user browsing or support impersonation UI in V1. Operational infrastructure access is separately controlled and audited; do not claim that encryption makes content inaccessible to the service operator.
- Publishing to Instagram/YouTube remains an explicit user-authorized exception: the chosen video leaves the private workspace and follows the destination's visibility settings. Explain this in the final publication summary. Nothing is published merely by generating or downloading a video.
- Downloaded files are under the user's control and may be shared externally; VidSprout.ai does not promise DRM or prevent recording/copying by the owner.

- Encrypt provider credentials at rest; hash passwords separately using the password-authentication requirements. Server-side secrets only; never place passwords/tokens in client bundles, media URLs, or logs.
- Scope access by owner for projects, assets, jobs, renders, and social connections; use expiring signed URLs.
- Protect OAuth with state validation and appropriate flow protections; verify callback/webhook authenticity and replay behavior where used.
- Validate URLs and uploaded assets against SSRF, oversized payloads, decompression/resource exhaustion, and malicious media. Run rendering/transcoding in isolated workers with bounded resources.
- Generated scene data can only instantiate allowlisted templates; never execute arbitrary AI-generated code.
- Minimize provider data sent: script/transcript rather than unrelated account data; do not log raw narration by default.
- Explain provider processing and deletion policies. Local deletion cannot promise removal from independent social platforms or provider retention beyond contractual guarantees.
- Internal concurrency caps, queues, and abuse protection are allowed without exposing credits or billing controls.
- Record trace IDs, provider IDs, durations, sanitized errors, queue delay, and retry counts for diagnosis.
- Alert operators on rising failure rates, stuck jobs, token failures, scheduler lag, and duplicate-risk incidents.
- Persistent in-app action-needed states are required. Email-based login is excluded; any password-recovery email service requires a separate decision.

### 11.1 Proposed pilot service targets

- Proposed prototype limit: one active generation per account; global queue/worker capacity depends on validated free infrastructure. No ten-user concurrency promise before benchmarking.
- At least 95% of supported clean-input generation jobs succeed in a controlled 100-job pilot run, excluding injected outages and policy-invalid input.
- P95 queue-plus-generation time under five minutes for the agreed 90-second template benchmark on the chosen deployment. Benchmark before promising this to customers.
- For healthy connections/providers, 99% of due post jobs begin final publication handling within 60 seconds of scheduled time. Platform visibility latency is measured separately and not guaranteed.
- No duplicate posts in replay, timeout, and double-click tests.
- Zero unapproved publication and zero cross-owner data access in release tests.

## 12. Acceptance criteria and test coverage

| ID | Acceptance scenario |
|---|---|
| A01 | A new user reaches an approved video through four top-level steps, without branding, pricing, credits, or duration-selection screens |
| A02 | English topic input yields an automatically scripted, narrated, synchronized final video with no script or scene editor |
| A03 | A clean 52-second recording retains the original voice and produces an approximately matching duration without unapproved trimming |
| A04 | Inputs of 89.9, 90.0, and 90.1 seconds exercise exact cap behavior; every approved export is at most 90.000 seconds |
| A05 | Every initial template renders in both orientations without clipping; default new-project orientation is 9:16 |
| A06 | Alignment passes the defined annotated-corpus target; missing timestamps trigger a visible fallback/review path |
| A07 | Completed audiovisual output is immutable through UI and API; no editing or creative regeneration controls exist |
| A08 | Browser refresh, double clicks, worker restart, and delayed old jobs preserve correct version/state without duplicate generation intents |
| A09 | Download requires no social connection; a failed provider does not remove an existing valid render |
| A10 | Both-platform publish creates two distinct intents; failure of one leaves the successful post untouched |
| A11 | A timeout after provider acceptance does not cause a duplicate post; unresolved outcomes require action |
| A12 | Scheduler tests cover DST gaps/overlaps, timezone changes, expired tokens, retries, downtime, cancellation, and rescheduling races |
| A13 | Schedule/metadata updates preserve the exact final video; a separate new project cannot replace a scheduled render implicitly |
| A14 | Project deletion and disconnection cannot leave silently authorized pending posts or expose other owners' media |
| A15 | No publish happens without approval of the exact audiovisual render and confirmation of destination/metadata |
| A16 | English long text, numbers, scientific notation, names, punctuation, and varied English accents pass layout/speech tests; unsupported languages are rejected clearly |
| A17 | User-facing errors preserve inputs and offer a practical recovery action |
| A18 | Signup collects name/email/password and opens the dashboard; subsequent sign-in uses email/password without a magic link or OTP |
| A19 | Duplicate signup, wrong password, session expiry, logout, password hashing, rate limiting, and cross-account isolation pass tests |
| A20 | Free-tier exhaustion never causes an unauthorized paid upgrade; hosting and provider eligibility are checked before launch |
| A21 | Better Auth registration/login/session flows use MongoDB correctly and do not add magic-link login |
| A22 | Direct R2 upload/download is owner-authorized; credentials remain server-side; expired URLs and missing objects recover safely |
| A23 | Inngest duplicate events, delayed steps, cancel/reschedule races, and database/event dispatch gaps do not create duplicate outputs/posts |
| A24 | Remotion runs in Sandbox, final artifacts reach R2 before success, and all terminal paths release compute resources |
| A25 | With two independent accounts, neither can list, search, stream, download, mutate, subscribe to, or publish the other's resources, even when valid IDs are known |
| A26 | Signing out/in as another account clears previous thumbnails, previews, notifications, and calendar data; shared caches cannot leak private content |
| A27 | R2 objects have no public bucket route; owner-authorized playback/download and narrow provider access work without a public share-link feature |
| A28 | Generation never publishes automatically; final social publication confirmation identifies destination and visibility boundary |

Test levels: unit tests for duration/timestamp/version rules; mocked integration tests for provider responses; real staging uploads to owned test accounts; controlled worker/scheduler failure injection; visual checks for every template/orientation; accessibility and account-isolation checks.

Use a labeled audio corpus with short/long speech, pauses, accents, background noise, numbers, and exact-boundary recordings. Launch only language/voice/alignment combinations that pass. Do not infer multilingual readiness from a provider's marketing list alone.

## 13. Delivery sequence and launch gates

### Phase 1 — Technical validation

- Produce three representative outputs: uploaded-voice explainer, AI-voice lesson, and mixed-media creator video.
- Validate ElevenLabs timing and pronunciation, WhisperX alignment, both orientations, and 90-second enforcement.
- Confirm licenses, data-handling configuration, compute capacity, and eligible developer accounts.
- Validate real Instagram and YouTube upload/publish flows early; do not defer external access risk to the last week.

### Phase 2 — Core creation

- Implement name/email/password registration and private ownership, Home/My Videos, four-step flow, automatic templates, input autosave, final-video library, generation queue, and download; no editor.
- Complete narration preservation, versioning, approval, and render QA.

### Phase 3 — Publishing and calendar

- Implement connections, metadata/declarations, publish now, durable scheduling, independent platform statuses, reconciliation, and recovery.
- Test platform-compatible formats and all schedule/cancel races.

### Phase 4 — Pilot and readiness review

- Run acceptance suite and representative educator/creator sessions.
- Validate operating expenses and capacity without adding billing UI.
- Confirm platform access/review requirements and license eligibility before offering publishing to general users.
- A download-only pilot may proceed if explicitly chosen, but does not constitute completion of the agreed publishing-enabled V1.

## 14. Decisions still to validate

| Decision | Proposed direction / release gate |
|---|---|
| Initial language — confirmed | English only |
| Name and ownership — confirmed | VidSprout.ai; individual private accounts only; no cross-user sharing or public profiles |
| Application stack — confirmed | Next.js frontend, Node.js backend, MongoDB database, Vercel application deployment |
| No editing — confirmed | Final generated audiovisual output cannot be customized; approval/watch/download/publish remain |
| Authentication — confirmed | Better Auth with MongoDB adapter; name/email/password signup and email/password login; no magic links/OTP |
| Recovery — open | Decide secure password recovery, email delivery if chosen, and account/email-change behavior |
| Free tools and launch intent — open | Clarify personal non-commercial prototype versus commercial launch; free Vercel/ElevenLabs cannot be assumed suitable for the latter |
| ElevenLabs plan/model — proposed | Evaluate Flash v2.5 for eligible free non-commercial testing; paid commercial plan is not authorized. Alternative free-license voice provider requires approval |
| Remotion eligibility — open | Confirm total organization size/status; free eligibility cannot be assumed |
| Voice selection — open | Small pre-generation selector versus automatic default English voice; no post-generation changes |
| Media storage — confirmed | Cloudflare R2 for all persisted video/audio/assets; bucket/access/lifecycle configuration to implement |
| Orchestration — confirmed | Inngest for background workflows and scheduling; validate deployment limits and timing behavior |
| Rendering — confirmed | Remotion running in Vercel Sandbox; benchmark rendering resources, timeouts, and free allowance |
| Transcription compute — open | Validate WhisperX Python/CPU environment; separate Sandbox processing is a candidate, not yet benchmarked |
| Source limits — proposed | 5,000 text characters; 25 MB and 90 seconds for MP3/WAV/M4A; no in-app trim; defer visual uploads pending confirmation |
| Scheduling window — proposed | 15 minutes to 30 days ahead, detected timezone shown; validate processing lead time and durable scheduler |
| Resolution — proposed | 720p prototype; benchmark before committing to 1080p |
| Platform compatibility | Validate current media specs, account permissions, quotas, and review requirements with selected API versions |
| Retention | Review proposed cleanup/backup periods against deployment and provider contracts |
| Music collection | Verify rights for redistribution embedded in user exports |
| Domain registration — pending | VidSprout.ai is selected; confirm registrar availability/pricing and name clearance before registration |

## 15. Reference documentation

External API terms and model availability can change. Recheck these during implementation and before launch; do not hard-code unverified quota numbers into product promises.

- **S1 — ElevenLabs speech with timing:** https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps
- **S2 — ElevenLabs API pricing and commercial usage:** https://elevenlabs.io/pricing/api and https://help.elevenlabs.io/hc/en-us/articles/13313564601361-Can-I-publish-the-content-I-generate-on-the-platform
- **S3 — Gemini API pricing/free-tier conditions:** https://ai.google.dev/gemini-api/docs/pricing
- **S4 — WhisperX capabilities, alignment limitations, and license:** https://github.com/m-bain/whisperX
- **S5 — Remotion license eligibility:** https://www.remotion.dev/docs/license/faq
- **S6 — FFmpeg license considerations:** https://ffmpeg.org/legal.html
- **S7 — Pexels API and media license:** https://www.pexels.com/api/documentation/ and https://www.pexels.com/license/
- **S8 — YouTube upload API:** https://developers.google.com/youtube/data/reference/rest/v3/videos/insert
- **S9 — YouTube video status, processing, audience, and scheduling fields:** https://developers.google.com/youtube/data/reference/rest/v3/videos
- **S10 — Meta Instagram publishing documentation:** https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/content-publishing and Meta's official API collection at https://www.postman.com/meta/workspace/instagram/documentation/23987686-9386f468-7714-490f-9bfc-9442db5c8f00
- **S11 — Vercel commercial-use eligibility:** https://vercel.com/legal/terms
- **S12 — Vercel cron restrictions:** https://vercel.com/docs/cron-jobs/usage-and-pricing
- **S13 — Remotion browser rendering:** https://www.remotion.dev/docs/client-side-rendering
- **S14 — Better Auth email/password and MongoDB adapter:** https://better-auth.com/docs/authentication/email-password and https://better-auth.com/docs/adapters/mongo
- **S15 — Cloudflare R2 pricing/allowances:** https://developers.cloudflare.com/r2/pricing/
- **S16 — Inngest Next.js, scheduling, and allowances:** https://www.inngest.com/docs/getting-started/nextjs-quick-start and https://www.inngest.com/docs/durable-execution/guides-and-advanced/events-and-triggers/schedules-and-delayed-starts and https://www.inngest.com/pricing
- **S17 — Remotion on Vercel:** https://www.remotion.dev/docs/vercel
- **S18 — Vercel Sandbox and pricing:** https://vercel.com/docs/sandbox and https://vercel.com/docs/sandbox/pricing

## 16. Revision 2 change record

Updated the existing PRD (the requirements document referred to as BRD in the update request) rather than creating a second conflicting specification. Removed user editing/customization throughout screens, pipelines, data rules, edge cases, and tests. Confirmed English, Next.js/Node.js/MongoDB/Vercel, and name/email/password registration. Added free-tool feasibility gates and clearly labeled proposed input/schedule/resolution defaults. Paid plans, commercial intent, organization eligibility, and processing infrastructure remain unresolved, not silently approved.

### Revision 3

Selected Better Auth, R2, Inngest, and Remotion on Vercel Sandbox. Updated architecture, authentication, storage handoffs, scheduling ownership, failure recovery, acceptance criteria, and open decisions. Removed local/browser rendering as the selected approach. The existing free-tool preference remains: selecting these providers does not approve charges or establish unlimited free operation. Sandbox/R2/Inngest allowances and commercial eligibility must be checked before provisioning. Earlier revision notes are historical; revision 3 takes precedence.

### Revision 4

Named the project VideoLoom and made individual private ownership explicit throughout the product. Added account-scoped dashboards/profile, no-sharing exclusions, authorization/cache/storage requirements, publishing visibility boundaries, and cross-account acceptance tests. Domain/trademark availability remains unchecked. Revision 4 takes precedence over earlier historical notes.

### Revision 5

The user selected VidSprout.ai. Updated the current product title, identity, privacy requirements, and decision table, and adopted the tagline “Your ideas. Your voice. Your videos.” Earlier names remain only in the historical change record and domain research. No feature scope changed. Revision 5 is the current revision and supersedes earlier naming decisions.

## 17. Naming review — 22 October 2026

**Decision:** VidSprout.ai selected by the user. The following records the research preceding that selection.

Verified the individual private workspace requirements and acceptance tests A25–A28 are present. No additional product scope change was needed. The user wrote VideoDoom, while the document's working name was VideoLoom; both domains were checked without assuming these were the same name.

| Candidate | Registry lookup result | Naming assessment |
|---|---|---|
| VideoLoom.ai | HTTP 200 registered-domain response | Do not assume this domain can be newly registered |
| VideoDoom.ai | HTTP 404, no domain record returned | Possible candidate, but “doom” gives a darker tone than the educational product |
| VidSprout.ai | HTTP 404, no domain record returned | Selected project name: learning, growth, and ideas becoming videos |
| VideoNook.ai | HTTP 404, no domain record returned | Emphasizes a personal video workspace |
| VidLesson.ai | HTTP 404, no domain record returned | Clear education focus, less broad for general creators |

Read-only lookups used rdap.org, which redirected to Identity Digital's registry RDAP endpoint, for example https://rdap.identitydigital.services/rdap/domain/vidsprout.ai. A missing registration record is not a guarantee of registrability: reserved/premium names, pricing, and availability must be confirmed at a registrar at purchase time. No trademark clearance or ownership claim is implied. The naming decision authorizes the PRD rename, not domain registration or payment.

## 18. Definition of Done — what a completed V1 means

### 18.1 The outcome in plain language

**VidSprout.ai V1 is done when an educator or content creator can create a private account, provide an English topic, notes, or their own voice recording, and receive a finished video with synchronized narration, animation, and captions. They can then download it or explicitly approve it for immediate or scheduled publication to their connected Instagram and YouTube accounts.**

The video is vertical by default, with landscape available before generation. AI decides its length, never exceeding 90 seconds. The user does not edit the generated video. Only the owner can access it inside VidSprout.ai; social publication happens only when the owner authorizes it.

This is the final V1 deliverable: a working creation-to-publication product, not just dashboard screens, a clickable demo, or sample videos generated outside the application.

### 18.2 User-facing completion checklist

All boxes below must be verified against the running product. They are requirements, not claims of work already completed.

- [ ] **Create and access an account:** A person signs up with name, email, and password through Better Auth, signs in again, and can sign out. Passwords are securely hashed and sessions are protected. The agreed secure password-recovery approach is implemented and tested before public launch.
- [ ] **Use a private dashboard:** Home, My Videos, and Calendar work with real account data. Each person sees only their own profile, videos, assets, generation status, and scheduled posts.
- [ ] **Start from an idea:** A user can enter a topic, paste English notes, or choose an AI-suggested idea. AI creates the script and chooses suitable visual scenes automatically.
- [ ] **Start from their own voice:** A supported English recording produces a video retaining that recording's voice. Invalid, unclear, oversized, or over-90-second recordings receive a useful error; no hidden trimming or voice replacement occurs.
- [ ] **Use AI voiceover:** The topic/notes path generates understandable English narration through the approved, legally usable voice provider and plan. ElevenLabs remains preferred; any alternative requires an explicit decision before implementation.
- [ ] **Receive a finished video:** Motion graphics, visual-story scenes, and mixed scenes work using the supported template set. Captions and meaningful scene/animation events follow the narration. Optional background music, when included automatically, does not obscure speech.
- [ ] **Let AI handle length:** No duration-selection step is needed. The encoded output is at most 90 seconds, with no cut-off speech or unnecessary padding. Boundary cases pass the tests in section 12.
- [ ] **Choose orientation before generation:** Vertical 9:16 is the default; landscape 16:9 works with readable layouts. The final video does not offer editing, customization, or creative regeneration controls.
- [ ] **Complete the four-step journey:** Add content → Confirm basic options → Generate and watch → Download, publish, or schedule. Signup is separate; there is no extra editing wizard.
- [ ] **Watch and download:** The owner can play the actual finished output and download a valid MP4 without connecting a social account. Returning later retrieves it from the private video library.
- [ ] **Publish directly:** The owner can connect eligible Instagram and YouTube accounts, confirm the destination and required publication information, and publish the approved video through the real integrations. Both destinations work, with independent statuses.
- [ ] **Schedule reliably:** The owner can schedule, reschedule, or cancel a future post with a visible timezone. Publication is attempted at the scheduled time under the defined service target. A missed or failed post is clearly reported and is not silently published much later.
- [ ] **Recover from failures:** Closing the browser does not lose an accepted server-side job. Technical retries, expired connections, failed uploads, and provider outages preserve recoverable state. Retrying one failed destination does not repost to a successful destination.

Publication titles, descriptions, captions, destinations, and dates remain configurable; these are posting details, not an editor for the video itself.

### 18.3 Engineering and launch completion checklist

- [ ] **The selected stack runs end to end:** Next.js/Node.js on Vercel; MongoDB for application/authentication metadata; Better Auth for account access; R2 for persisted media/assets; Inngest for workflows/scheduling; Remotion in Vercel Sandbox for rendering. The transcription execution environment is selected and validated.
- [ ] **Infrastructure stays internal:** No end-user Settings navigation/icon, provider configuration panels, credentials requests, or infrastructure enablement toggles. Failure states use plain language; social-account authorization remains part of publishing.
- [ ] **Outputs are durable:** A job is not marked successful until its validated output is saved in R2 and linked to the correct account in MongoDB. Sandbox termination does not remove the finished video. Temporary resources are cleaned up safely.
- [ ] **Account isolation passes:** Acceptance tests A25–A28 and associated endpoint/cache checks prove one account cannot access another account's resources, even with known IDs. No public profile, public library, or in-app sharing link exists.
- [ ] **Publication is authorized and duplicate-safe:** Tests cover double clicks, duplicate Inngest events, timeout after provider acceptance, cancellation races, and partial platform failure. No unapproved or duplicate post is produced in the test suite.
- [ ] **Acceptance criteria are passed:** Every applicable criterion A01–A28 has a recorded result. Every edge case E01–E62 has an implemented handling path and appropriate automated or documented manual verification; no unresolved defect defeats a core completion requirement.
- [ ] **Media quality is demonstrated:** Representative English educator and creator samples pass duration, orientation, playback, caption readability, voice preservation, and synchronization checks. The section 6 timing target is measured, not assumed.
- [ ] **Real integrations are verified:** Test accounts demonstrate actual generation, storage, download, direct publication, scheduling, and recovery. Mock responses alone do not count as completed integrations. Required platform access/reviews are obtained for the intended launch audience.
- [ ] **Capacity and timing are validated:** The section 11 service targets and proposed input/scheduling limits are benchmarked on the selected deployment. If a target is infeasible, obtain an explicit scope/target decision and update this PRD before claiming completion.
- [ ] **Free-tool constraints are resolved honestly:** The selected hosting, voice, workflow, rendering, and storage plans are eligible for the intended use and fit an agreed operating limit. No unauthorized purchase, hidden paid dependency, or assumption of unlimited free service is used to satisfy this checklist.
- [ ] **Recovery and operations are ready:** Errors expose useful recovery actions without secrets; logs identify failed stages; operators can detect stuck workflows; retention/deletion and resource-cleanup behavior are tested.
- [ ] **Launch decisions are closed:** Decide commercial versus non-commercial launch, Remotion eligibility, voice plan/model and pre-generation voice-selection behavior, password recovery, source limits, resolution, scheduling limits, transcription hosting, and domain/name readiness. Record the final choices in section 14.
- [ ] **Owner review is complete:** Demonstrate the working product and provide test results plus any documented non-blocking limitations. The product owner accepts the V1 result. No unresolved blocker to account privacy, generation, download, or either publishing integration is relabeled as a limitation to declare completion.

### 18.4 Final demonstration

The final walkthrough must show these scenarios using real stored outputs and controlled test social accounts:

1. **Educator, topic to video:** Sign up, enter “Explain evaporation to a beginner,” generate an English vertical video, watch synchronized visuals/captions, and download it. AI determines the duration; no editor is shown.
2. **Creator, voice to animation:** Upload a clean 52-second English recording, choose landscape, and receive a finished animation using the same voice and approximately matching duration within the cap.
3. **Private accounts:** Sign in as a second person and confirm the first person's videos, files, profile data, and scheduled posts cannot be viewed or requested through the API.
4. **Publish and schedule:** Approve a final video, publish to one connected platform, schedule it on the other, and observe the verified outcome and platform link. Also demonstrate reschedule/cancel before submission.
5. **Failure and recovery:** Exercise an expired connection, a technical generation failure, and a timeout/duplicate-delivery case. Show clear status, safe recovery, and no duplicate publication.

### 18.5 What does not need to be built

V1 completion does not require video editing, custom branding, payments, subscriptions, usage-credit screens, shared workspaces, public profiles, voice cloning, avatars, languages beyond English, or videos longer than 90 seconds. These remain outside the agreed scope.

An attractive dashboard without functioning generation is not done. Download-only generation without the agreed Instagram/YouTube publishing and scheduling is a partial milestone, not the full V1. A local or mocked demonstration alone is not launch-ready.

**Current document status:** This checklist defines completion; it does not certify it. No box is marked complete merely because its requirement has been written in this PRD.

### Revision 6

Added a plain-language Definition of Done, user-facing and technical completion checklists, a final demonstration, and explicit exclusions. No implementation is claimed and no new paid services are authorized. Revision 6 is the current revision.

This document defines the proposed V1 requirements for review. It does not claim that integrations have been built, that platform approvals have been obtained, or that the proposed service targets have already been achieved.
