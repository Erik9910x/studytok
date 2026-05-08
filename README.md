# StudyTok

StudyTok is an AI study workspace for Vietnamese notes. It turns long text into concise study packs with summaries, keywords, flashcards, quizzes, focus mode, and offline TXT export.

## Features

- Video landing page with a liquid-glass aesthetic
- Separate Notion-style Studio page at `/studio`
- Groq-powered study pack generation via server-side API route
- Configurable generation levels for summary length, quiz count, and practice questions
- Revealable flashcards and quiz focus mode
- Offline `.txt` export for summaries, keywords, flashcards, and quizzes
- VN/EN UI toggle in Studio

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Groq API

## Environment

Create `.env.local` from `.env.local.example` and fill in your own Groq keys:

```env
GROQ_API_KEYS=key1,key2,key3
GROQ_MODEL=openai/gpt-oss-120b
GROQ_FALLBACK_MODEL=openai/gpt-oss-20b
MAX_NOTE_CHARS=12000
```

Do not commit `.env.local`. It is ignored by `.gitignore`.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
