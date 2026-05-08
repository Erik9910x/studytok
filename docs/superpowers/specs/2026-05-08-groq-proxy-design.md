# Groq Proxy Real AI Design

## Goal

Replace local-only study-pack generation with a server-side Groq AI proxy that keeps API keys off the frontend and returns structured `StudyPack` JSON.

## Scope

Included:
- `POST /api/study-pack` Next.js route.
- Server-side Groq key rotation via `GROQ_API_KEYS`.
- Primary model `openai/gpt-oss-120b`.
- Fallback model `openai/gpt-oss-20b`.
- Structured JSON schema response.
- Input length limit via `MAX_NOTE_CHARS`.
- Frontend loading/error states.
- `.env.local.example` and `.gitignore`.

Excluded:
- Auth.
- Database persistence.
- OCR.
- Per-user billing.
- Production distributed rate limiting.

## Data flow

```text
Frontend note input
  -> POST /api/study-pack
  -> validate note
  -> try each Groq API key with primary model
  -> try fallback model if needed
  -> parse StudyPack JSON
  -> frontend renders real AI output
```

## Safety

Groq keys must remain in `.env.local` or deployment environment variables. `.env.local` must not be committed.
