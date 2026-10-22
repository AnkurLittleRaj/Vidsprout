## Project documentation maintenance

- Read `PROJECT-STATUS.md` before starting project changes.
- For every meaningful implementation, design, configuration, or documentation change, append a numbered entry to `PROJECT-STATUS.md` in the same work session before the final handoff. Use the next available `VS-NNN` ID; never renumber or reuse existing IDs.
- Record the date, actual change, affected files, verification performed, and remaining limitations. Update its current-status summary and next-ID pointer when needed.
- Add reversals as new entries referencing the earlier ID. Preserve historical facts; never claim planned or untested work is complete.
- Keep this history documentation-only. Do not expose it in the product UI or add runtime logging/telemetry for it. Never record secrets or credential values.
- This file is maintained as part of repository work; it is not automatically updated by a background watcher.

## GitHub delivery

- The user has authorized committing and pushing completed coding changes to their VidSprout GitHub repository. Update `PROJECT-STATUS.md`, run relevant checks, review the diff and staged secret scan, then commit and push in the same work session.
- Use the verified remote configured for this repository; never guess an owner from a display name. If the remote or authentication is missing, finish the local reviewable work and report the blocker.
- The repository is public. Never commit real environment files, API keys, tokens, local media, local tools, dependency directories, or generated build output. `.env.example` must contain placeholders only for credentials.
- Run `node scripts/check-public-files.mjs` before staging and `node scripts/check-public-files.mjs --staged` before committing. Review staged filenames/diffs as well; pattern scanning is not proof that all sensitive information has been found.
- Do not force-push or discard remote changes. Fetch and reconcile existing history before pushing. Report the commit and push outcome accurately.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
