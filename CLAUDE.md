# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workflow

- Propose the solution first, get user confirmation, then write code. Do not jump straight to editing.
- After changes: `pnpm build` → test locally → tell user what changed.
- Never push to GitHub without explicit user permission ("要推送吗?").

## Commands

```bash
pnpm dev          # Start dev server on port 3000
pnpm build        # Production build + lint + type-check
```

Build uses Node 18+ and pnpm. The `.next` directory can get corrupted after `git reset --hard` — if you see "Cannot find module './719.js'", delete `.next` and restart.

## Architecture

**Next.js 14 App Router**, single-page app with two API routes, deployed on Vercel.

**AI client factory** (`lib/openai.ts`): `createClient(userKey?, baseUrl?)` creates an OpenAI SDK instance. The server API key defaults to `DEEPSEEK_API_KEY` from env, overridden by user's own key sent via `x-user-api-key` header. The `baseURL` and `model` name are also configurable via `x-api-base` / `x-model` headers. This lets users plug in any OpenAI-compatible provider (DeepSeek, OpenAI, 智谱, 通义千问, Moonshot).

**API routes** share a common auth/rate-limit pattern:
1. Check `x-access-password` header against `ACCESS_PASSWORD` env
2. Check `x-user-api-key` header — if present, use it instead of server's key
3. Read `x-api-base` / `x-model` headers for multi-model support
4. IP rate limit (per minute, in-memory)
5. Daily global quota (in-memory, resets every 24h)

`/api/generate` streams via `text/event-stream` (SSE). The `streamFetch()` helper in `page.tsx` parses the SSE stream.

`/api/correct` is non-streaming — it takes raw voice-to-text input plus student names/subject terms, uses AI to fix recognition errors, returns corrected text.

**State management**: Pure React `useState` + `localStorage` for persistence. No state library.

**Rate limiting** (`lib/ratelimit.ts`): In-memory `Map` for IP tracking and a global daily counter. Resets on server restart (no persistence). Configurable via `RATE_LIMIT_PER_MIN` and `DAILY_QUOTA` env vars.

## Key conventions

- All UI text in Chinese (target users are Chinese tutors)
- Web Speech API types declared in `lib/speech.d.ts` (not in `@types/dom-speech-recognition`)
- Password gate: both frontend `authenticated` state + backend header check — both must pass
- Environment variables: `DEEPSEEK_API_KEY`, `ACCESS_PASSWORD`, `DAILY_QUOTA`, `RATE_LIMIT_PER_MIN` in `.env.local`
- ESLint: `next/core-web-vitals` + `next/typescript` — unescaped entities like `"` must use `&ldquo;`/`&rdquo;`
