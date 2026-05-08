# StudyTok

> AI workspace giúp biến văn bản dài và ghi chú tiếng Việt thành bộ ôn tập gọn gàng, dễ học, có thể dùng online lẫn offline.

StudyTok gồm landing page video cinematic và Studio riêng để tạo summary, keywords, flashcards, quiz, focus mode, export TXT bằng Groq AI qua server-side API.

## Highlights

- Landing page tiếng Việt với video background và liquid-glass UI
- Studio page riêng tại `/studio` theo phong cách Notion nền trắng, xanh lá rêu
- Groq AI chạy qua API route server-side, không expose key ra frontend
- Tùy chỉnh trước khi tạo bộ ôn tập bằng popup blur:
  - Mức độ rút gọn: Tối thiểu / Ngắn / Trung bình / Dài / Chi tiết
  - Số quiz mong muốn
  - Số câu practice / flashcard mong muốn
- AI trả output theo exact-count schema, hạn chế tình trạng chọn “Chi tiết” nhưng trả quá ít
- Bộ ôn tập gồm:
  - Tóm tắt theo từng phần
  - Keywords
  - Flashcards có reveal đáp án
  - Quiz nhiều câu với đáp án
- Focus Mode cho Flashcard và Quiz:
  - Popup giữa màn hình
  - Blur nền phía sau
  - Previous / Next
  - Chuyển qua lại giữa Flashcard và Quiz
- Export offline `.txt` gồm summary, keywords, flashcards, quiz và đáp án
- Toggle VN/EN trong Studio
- `.env.local` được ignore để bảo vệ API keys

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Groq OpenAI-compatible API

## Project Structure

```txt
app/
  page.tsx                 Landing page
  studio/page.tsx          StudyTok Studio UI
  api/study-pack/route.ts  Server-side Groq proxy
lib/
  study-pack.ts            Local fallback generator + StudyPack type
```

## Environment

Copy `.env.local.example` to `.env.local` and add your Groq keys:

```env
GROQ_API_KEYS=key1,key2,key3
GROQ_MODEL=openai/gpt-oss-120b
GROQ_FALLBACK_MODEL=openai/gpt-oss-20b
MAX_NOTE_CHARS=12000
```

`.env.local` is ignored by Git. Do not commit real keys.

## Development

```bash
npm install
npm run dev
```

Open:

- Landing: `http://localhost:3000`
- Studio: `http://localhost:3000/studio`

## Build

```bash
npm run build
```

## Current Features

| Area | Status |
| --- | --- |
| Video landing page | Done |
| Notion-style Studio | Done |
| Groq AI generation | Done |
| Custom generation settings | Done |
| Exact output count rules | Done |
| Flashcard reveal | Done |
| Quiz + answers | Done |
| Focus Mode | Done |
| TXT offline export | Done |
| VN/EN UI toggle | Done |
