# VidSprout.ai

**Your ideas. Your voice. Your videos.**

For the current implementation status and numbered change history, see [Project status](./PROJECT-STATUS.md). Future project changes must update that document alongside the work, as described in `AGENTS.md`.

## Development and releases

Daily work is committed and pushed to `dev`. The existing `main` branch is the release branch. Review a pull request from `dev` to `main` and obtain the owner's explicit manual approval before merging. Development push authorization does not authorize a release merge. GitHub branch protection is separate and has not been configured by this workflow change.

Foundation prototype for the [V1 PRD](./PRD-V1.md). This repository now contains a Next.js application, not just planning documents. It is **not a completed V1**.

## Implemented in this milestone

- Responsive Home and private My Videos screens; infrastructure is managed internally.
- Better Auth name/email/password registration and login backed by MongoDB.
- Owner-scoped job listing and private video streaming/download with byte ranges.
- A fixed 12-second, silent Remotion animation in vertical and landscape.
- Transactional generation admission, one active job per account, idempotent request keys, and durable dispatch records.
- Inngest orchestration and reconciliation; Remotion rendering in Vercel Sandbox; direct private R2 output with size/checksum verification.
- Live rendering disabled unless explicitly configured and enabled. No mocked video is presented as a completed generation.

## Not implemented yet

Gemini script generation, ElevenLabs voiceover, WhisperX uploads/alignment, AI-decided duration, full content templates, social connections/publishing/calendar, password recovery, project deletion/retention, and production operational hardening. The 12-second test is deliberately fixed and silent; it does not prove narration synchronization.

Do not publicly launch this prototype. Provider integrations must be exercised with your authorized credentials and appropriate plan eligibility. No services are provisioned by installation or the build.

## Local setup

### Watch a sample without any services

For visual review only, set `LOCAL_PREVIEW=true` in `.env.local`, then run:

```sh
pnpm render:bundle
pnpm exec remotion browser ensure
pnpm render:preview
pnpm dev --hostname 127.0.0.1
```

The Home dashboard shows the rendered 12-second sample with playback and download. Its orientation switch selects the vertical or landscape MP4. No MongoDB, login, Inngest, R2, or Sandbox is used. The files stay in the ignored `.local-media/previews/` directory. This is a fixed visual sample, not AI generation or a saved personal-library video. The preview endpoint is disabled in production and on Vercel.

An optional database-backed local worker is scaffolded as `pnpm worker:local` with `LOCAL_RENDER=true`; it requires MongoDB and has not been integration-tested. It is not required for the sample preview.

### Optional ElevenLabs narration for the evaporation sample

Operator setup only: put `ELEVENLABS_API_KEY` and optionally `ELEVENLABS_VOICE_ID` in `.env.local`. Run `pnpm narrate:evaporation`, rebuild the animation bundle, then run `pnpm render:preview --evaporation --narrated`. The narrator command checks free-account quota before one synthesis request, saves the returned audio/timestamps locally, and avoids automatic paid retries. API access and voice eligibility still depend on the account. An existing response prevents another generation; inspect saved output before retrying a failed run.

The narration timestamp boundaries control scene transitions and video duration (maximum 90 seconds). Voiced outputs use separate `evaporation-narrated-*.mp4` filenames so a failed attempt cannot replace the working silent preview. Switch the UI to the narrated files only after audio playback and timing have been verified. The local evaporation POC was generated with the premade male voice George: 407 included free credits, 27.3-second MP4s with AAC audio in both orientations. Scene starts follow the returned speech timestamps at 0, 7.5, 12.945, and 18.645 seconds. The dashboard now selects the narrated files. This validates this local sample, not the full production narration pipeline.

ElevenLabs free-plan output has no commercial license; publishing it requires attribution. Do not assume a commercial SaaS POC qualifies as noncommercial use. See [ElevenLabs usage terms](https://help.elevenlabs.io/hc/en-us/articles/13313564601361-Can-I-publish-the-content-I-generate-on-the-platform).

Use Node.js 22 or newer and pnpm. The lockfile pins the tested dependency graph.

```sh
pnpm install
cp .env.example .env.local
pnpm dev
```

On Windows PowerShell, replace the copy command with `Copy-Item .env.example .env.local`.

Without credentials, the UI runs in an honest setup state: account creation and live rendering are unavailable. It does not create fake users, jobs, or outputs. Configure locally rather than pasting secrets into chat.

### 1. Authentication and database

Run `pnpm setup:check` to list missing configuration without printing secrets or contacting providers. This checks local settings and bundle presence only. A passing check does not verify credentials, plan eligibility, or connectivity.

Set `MONGODB_URI`, `MONGODB_DB`, `BETTER_AUTH_URL`, and a high-entropy `BETTER_AUTH_SECRET` of at least 32 characters. Use a MongoDB replica set/Atlas deployment supporting transactions; a standalone server is not sufficient for job admission.

```sh
pnpm db:indexes
```

This creates the unique job/email indexes used by the application. Better Auth manages its account/session collections. Start the server and create two test users to verify account isolation. Signup does not send email; password recovery is intentionally not falsely offered before a recovery provider is selected.

### 2. Workflow development

Set `INNGEST_DEV=1` only in local development. In a second terminal:

```sh
pnpm dlx inngest-cli@latest dev
```

Register/discover `http://localhost:3000/api/inngest`. Production needs the appropriate Inngest event/signing keys and must not run in development mode. Workflow handlers verify signatures through the Inngest SDK in production.

### 3. Render bundle

```sh
pnpm render:bundle
```

This bundles the trusted Remotion composition to `render-bundle/`. It does not contact Vercel or render a paid cloud video. The source composition uses no external fonts/assets.

### 4. R2 and Sandbox

Configure private R2 bucket credentials in `.env.local`. Keep bucket public access off. The prototype uploads from Sandbox via a scoped signed PUT and serves downloads through an authenticated API. It does not use Vercel Blob.

Configure Vercel OIDC for Sandbox access. Locally, link the intended project with the Vercel CLI and pull `VERCEL_OIDC_TOKEN` into your local environment; tokens expire and must be refreshed. The Remotion Sandbox helper uses OIDC rather than automatically reading a personal-access-token variable. Confirm Remotion license eligibility, Vercel plan restrictions, and actual Sandbox/R2 quotas before proceeding. The helper installs runtime dependencies in the Sandbox; first startup can be slow and requires outbound network access.

Only after these checks, set `ENABLE_LIVE_RENDER=true` and restart the app. Create a test video while signed in. This is the switch authorizing provider use in your environment, not a claim that provider execution is free. Wait for the job to reach `ready`, play/download it, and verify another account cannot access its URL.

The worker has a 20-minute Sandbox lifetime and a bounded polling loop. Sandbox startup itself runs inside a bounded Inngest handler; validate Vercel's actual function-duration plan before deployment. Never assume the declared route duration overrides plan limits.

## Verification commands

```sh
pnpm typecheck
pnpm test
pnpm render:bundle
pnpm build
```

Unit tests cover owner-scoped selectors, payload injection rejection, asset-key isolation, duration boundaries, report validation, and internal-field redaction. They do not replace real two-account database/API integration tests, provider rendering, or end-to-end media checks. See [prototype plan](./PROTOTYPE-PLAN-V1.md) for the remaining live experiments.

## Vercel preparation (not deployed)

- Build command: `pnpm render:bundle && pnpm build`.
- Use a private database/bucket and separate staging credentials; never use production social accounts in previews.
- Configure `BETTER_AUTH_URL` for the actual origin; do not enable arbitrary origins.
- The Inngest route includes the prebuilt render bundle and trusted worker script through Next.js output tracing.
- Never expose Sandbox/provider credentials to the browser. Provider configuration and diagnostic details stay server-side; the user interface receives only product availability flags.
- Production app admission, monitoring, account abuse limits, cleanup/retention, and password recovery need validation before public availability.

## Failure handling and limitations

Generation creates a MongoDB job and account slot transactionally. The queued job serves as a dispatch outbox. Inngest's reconciler dispatches records missed by an interrupted HTTP request. Render startup is claimed atomically; ambiguous startup results are not blindly repeated. The final MP4 is SHA-256 checked after R2 upload before the job becomes ready.

An external call cannot be made transactional with MongoDB. If submission is uncertain, the job requires operator review in Inngest. The prototype deliberately has no user-facing creative retry/editor. A stopped/missing Sandbox after an uncertain result may require manual inspection; full automatic orphan-output reconciliation remains future hardening. Objects from failed runs require operator cleanup until retention workflows are implemented. Sandbox timeouts bound orphan compute.

## Project layout

- `src/app` — Next.js UI and authenticated routes.
- `src/lib` — authentication, database, ownership rules, R2, jobs, Inngest, and Sandbox adapters.
- `src/remotion` — trusted animation composition.
- `scripts/sandbox-render.cjs` — trusted worker executing inside Sandbox; R2 transfer and report generation.
- `tests` — domain and boundary checks.

Architecture: [SYSTEM-ARCHITECTURE-V1.md](./SYSTEM-ARCHITECTURE-V1.md). Requirements: [PRD-V1.md](./PRD-V1.md). Neither document's Definition of Done is marked complete by this milestone.
