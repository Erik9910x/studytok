# StudyTok AI MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished Apple-inspired mobile-first StudyTok AI MVP that turns pasted notes into a mock study pack with summary, flashcards, and quiz UI.

**Architecture:** Create a small Next.js TypeScript app in the workspace root. Use local deterministic study-pack generation so the first pass focuses on UI/UX quality while preserving clear boundaries for future OCR/LLM integration.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS, React state, local mock data generation.

---

## File structure

- Create: `package.json` — scripts and dependencies for the Next.js app.
- Create: `next.config.ts` — minimal Next.js config.
- Create: `tsconfig.json` — TypeScript config.
- Create: `postcss.config.mjs` — Tailwind PostCSS config.
- Create: `tailwind.config.ts` — Apple-inspired design tokens and content paths.
- Create: `app/layout.tsx` — root HTML shell and metadata.
- Create: `app/page.tsx` — main StudyTok AI UI and interactions.
- Create: `app/globals.css` — global styling, background, typography polish.
- Create: `lib/study-pack.ts` — `StudyPack` types and local generator function.

---

### Task 1: Scaffold the Next.js project files

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "studytok-ai",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@next/third-parties": "latest",
    "clsx": "latest",
    "framer-motion": "latest",
    "lucide-react": "latest",
    "next": "latest",
    "react": "latest",
    "react-dom": "latest"
  },
  "devDependencies": {
    "@types/node": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "autoprefixer": "latest",
    "eslint": "latest",
    "eslint-config-next": "latest",
    "postcss": "latest",
    "tailwindcss": "latest",
    "typescript": "latest"
  }
}
```

- [ ] **Step 2: Create `next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create `postcss.config.mjs`**

```js
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

- [ ] **Step 5: Create `tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        appleBlue: "#0071E3",
        graphite: "#1D1D1F",
        porcelain: "#F5F5F7",
        mist: "#E8EEF8",
        lavenderMist: "#EEE9FF",
      },
      boxShadow: {
        soft: "0 20px 60px rgba(29, 29, 31, 0.10)",
        glass: "0 18px 45px rgba(0, 0, 0, 0.08)",
      },
      fontFamily: {
        display: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 6: Verify files exist**

Run: `ls package.json next.config.ts tsconfig.json postcss.config.mjs tailwind.config.ts`

Expected: all five filenames are printed.

---

### Task 2: Add study-pack domain logic

**Files:**
- Create: `lib/study-pack.ts`

- [ ] **Step 1: Create `lib/study-pack.ts`**

```ts
export type Flashcard = {
  question: string;
  answer: string;
};

export type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
};

export type StudyPack = {
  summary: string[];
  concepts: string[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
};

const fallbackNote =
  "Quang hợp ở cây xanh gồm pha sáng và pha tối. Pha sáng tạo ATP và NADPH nhờ ánh sáng. Pha tối sử dụng CO2 để tạo glucose, giúp cây tích lũy năng lượng và giải phóng oxy.";

export function generateStudyPack(note: string): StudyPack {
  const source = note.trim() || fallbackNote;
  const sentences = source
    .split(/[.!?。]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const primary = sentences[0] ?? fallbackNote;
  const secondary = sentences[1] ?? "Nội dung này có thể chuyển thành flashcards và quiz để ôn tập nhanh.";
  const tertiary = sentences[2] ?? "StudyTok AI ưu tiên kiến thức ngắn, rõ và dễ ghi nhớ.";

  return {
    summary: [
      primary,
      secondary,
      tertiary,
      "Bộ học tập được trình bày thành các phần nhỏ để học nhanh trên điện thoại.",
    ],
    concepts: extractConcepts(source),
    flashcards: [
      {
        question: "Ý chính đầu tiên của ghi chú là gì?",
        answer: primary,
      },
      {
        question: "Chi tiết nào nên được ghi nhớ tiếp theo?",
        answer: secondary,
      },
      {
        question: "Làm sao dùng nội dung này để ôn tập nhanh?",
        answer: "Đọc summary, lật flashcards, rồi tự kiểm tra bằng quiz ngắn.",
      },
    ],
    quiz: [
      {
        question: "StudyTok AI biến ghi chú thành nội dung nào?",
        options: ["Summary, flashcards và quiz", "Tin nhắn mạng xã hội", "Bảng tính tài chính", "Mã nguồn backend"],
        answerIndex: 0,
      },
      {
        question: "Cách học nào phù hợp nhất với MVP này?",
        options: ["Đọc dài không tương tác", "Ôn nhanh bằng thẻ và câu hỏi", "Chỉ lưu ảnh gốc", "Chỉ tạo lịch học"],
        answerIndex: 1,
      },
    ],
  };
}

function extractConcepts(text: string): string[] {
  const words = text
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 4);

  return Array.from(new Set(words)).slice(0, 6).map((word) => word[0].toUpperCase() + word.slice(1));
}
```

- [ ] **Step 2: Run TypeScript after dependencies are installed**

Run: `npm run typecheck`

Expected: no TypeScript errors after Task 5 installs dependencies.

---

### Task 3: Add global app shell styling

**Files:**
- Create: `app/globals.css`
- Create: `app/layout.tsx`

- [ ] **Step 1: Create `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color: #1d1d1f;
  background: #f5f5f7;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  min-height: 100vh;
  margin: 0;
  background:
    radial-gradient(circle at top left, rgba(0, 113, 227, 0.16), transparent 34rem),
    radial-gradient(circle at top right, rgba(175, 151, 255, 0.22), transparent 30rem),
    linear-gradient(180deg, #fbfbfd 0%, #f5f5f7 42%, #ffffff 100%);
  color: #1d1d1f;
}

button,
textarea {
  font: inherit;
}

::selection {
  background: rgba(0, 113, 227, 0.18);
}
```

- [ ] **Step 2: Create `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudyTok AI",
  description: "Apple-inspired AI study pack experience for Vietnamese students.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Verify app shell compiles after dependencies are installed**

Run: `npm run typecheck`

Expected: no TypeScript errors after all app files exist.

---

### Task 4: Build the Apple-inspired StudyTok AI page

**Files:**
- Create: `app/page.tsx`

- [ ] **Step 1: Create `app/page.tsx`**

```tsx
"use client";

import { useMemo, useState } from "react";
import { BookOpen, Brain, Camera, Check, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { generateStudyPack } from "@/lib/study-pack";

const sampleNote =
  "Quang hợp ở cây xanh gồm hai pha: pha sáng tạo ATP và NADPH nhờ ánh sáng; pha tối sử dụng CO2 để tạo glucose. Quá trình này giúp cây tích lũy năng lượng, tạo thức ăn và giải phóng oxy cho môi trường.";

export default function Home() {
  const [note, setNote] = useState(sampleNote);
  const [pack, setPack] = useState(() => generateStudyPack(sampleNote));
  const [activeCard, setActiveCard] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const activeFlashcard = pack.flashcards[activeCard];
  const quiz = pack.quiz[0];
  const canGenerate = note.trim().length > 0;

  const studyTime = useMemo(() => Math.max(3, pack.flashcards.length * 2), [pack.flashcards.length]);

  function handleGenerate() {
    if (!canGenerate) return;
    setPack(generateStudyPack(note));
    setActiveCard(0);
    setRevealed(false);
    setSelectedAnswer(null);
  }

  function moveCard(direction: 1 | -1) {
    setActiveCard((current) => (current + direction + pack.flashcards.length) % pack.flashcards.length);
    setRevealed(false);
  }

  return (
    <main className="min-h-screen overflow-hidden font-display">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-5 py-6 sm:px-8 lg:px-10 lg:py-10">
        <nav className="flex items-center justify-between rounded-full border border-white/70 bg-white/70 px-4 py-3 shadow-glass backdrop-blur-2xl">
          <div className="flex items-center gap-2 font-semibold text-graphite">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-graphite text-white">
              <Sparkles size={18} />
            </span>
            StudyTok AI
          </div>
          <a href="#demo" className="rounded-full bg-graphite px-4 py-2 text-sm font-medium text-white transition hover:bg-black">
            Try demo
          </a>
        </nav>

        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-medium text-graphite shadow-glass backdrop-blur-xl">
              <span className="h-2 w-2 rounded-full bg-appleBlue" /> Vietnamese-first AI learning
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.045em] text-graphite sm:text-7xl lg:text-8xl">
                Notes become study packs.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-black/62 sm:text-xl">
                Paste a lesson and StudyTok AI turns it into a clean summary, swipeable flashcards, and a quick quiz experience designed for Vietnamese students.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a href="#demo" className="rounded-full bg-appleBlue px-6 py-3 text-center font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-blue-600">
                Generate study pack
              </a>
              <a href="#roadmap" className="rounded-full border border-black/10 bg-white/70 px-6 py-3 text-center font-semibold text-graphite shadow-glass backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white">
                View roadmap
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm rounded-[3rem] border border-white/70 bg-white/80 p-3 shadow-soft backdrop-blur-2xl">
            <div className="rounded-[2.5rem] bg-graphite p-4 text-white shadow-inner">
              <div className="mx-auto mb-5 h-1.5 w-20 rounded-full bg-white/25" />
              <div className="space-y-4 rounded-[2rem] bg-white p-5 text-graphite">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-black/50">Today&apos;s pack</p>
                  <span className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-appleBlue">{studyTime} min</span>
                </div>
                <h2 className="text-2xl font-semibold tracking-tight">Quang hợp</h2>
                <div className="grid grid-cols-3 gap-2">
                  {["Summary", "Cards", "Quiz"].map((item) => (
                    <div key={item} className="rounded-2xl bg-porcelain px-3 py-4 text-center text-xs font-semibold text-black/60">
                      {item}
                    </div>
                  ))}
                </div>
                <div className="rounded-3xl bg-gradient-to-br from-mist to-lavenderMist p-4">
                  <p className="text-sm font-medium leading-6 text-black/70">{pack.summary[0]}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="demo" className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-12 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-glass backdrop-blur-2xl sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-appleBlue text-white">
              <Camera size={20} />
            </span>
            <div>
              <p className="font-semibold text-graphite">Study input</p>
              <p className="text-sm text-black/50">OCR-ready, text-first demo</p>
            </div>
          </div>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="min-h-64 w-full resize-none rounded-[1.5rem] border border-black/10 bg-porcelain p-5 leading-7 text-graphite outline-none transition focus:border-appleBlue focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            placeholder="Paste your Vietnamese study notes here..."
          />
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="mt-5 w-full rounded-full bg-graphite px-6 py-4 font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-black/20"
          >
            Generate Study Pack
          </button>
          <p className="mt-4 text-sm leading-6 text-black/50">
            This prototype uses local mock generation. Real OCR and LLM adapters can replace this boundary later.
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-glass backdrop-blur-2xl sm:p-8">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-graphite text-white">
                  <BookOpen size={20} />
                </span>
                <div>
                  <p className="font-semibold text-graphite">AI Summary</p>
                  <p className="text-sm text-black/50">Clear enough for quick review</p>
                </div>
              </div>
              <span className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-appleBlue">{pack.summary.length} bullets</span>
            </div>
            <div className="space-y-3">
              {pack.summary.map((item) => (
                <div key={item} className="rounded-2xl bg-porcelain px-4 py-3 text-sm leading-6 text-black/68">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {pack.concepts.map((concept) => (
                <span key={concept} className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-black/55">
                  {concept}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-white/70 bg-graphite p-6 text-white shadow-soft">
              <div className="mb-5 flex items-center justify-between">
                <p className="font-semibold">Flashcards</p>
                <span className="text-sm text-white/50">{activeCard + 1}/{pack.flashcards.length}</span>
              </div>
              <button
                onClick={() => setRevealed((value) => !value)}
                className="min-h-56 w-full rounded-[1.5rem] bg-white p-5 text-left text-graphite transition hover:scale-[1.01]"
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-appleBlue">{revealed ? "Answer" : "Question"}</p>
                <p className="text-xl font-semibold leading-8">{revealed ? activeFlashcard.answer : activeFlashcard.question}</p>
              </button>
              <div className="mt-4 flex items-center justify-between">
                <button onClick={() => moveCard(-1)} className="rounded-full bg-white/10 p-3 transition hover:bg-white/20" aria-label="Previous card">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => setRevealed((value) => !value)} className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-graphite">
                  {revealed ? "Hide answer" : "Reveal answer"}
                </button>
                <button onClick={() => moveCard(1)} className="rounded-full bg-white/10 p-3 transition hover:bg-white/20" aria-label="Next card">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-glass backdrop-blur-2xl">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lavenderMist text-graphite">
                  <Brain size={20} />
                </span>
                <div>
                  <p className="font-semibold text-graphite">Quick Quiz</p>
                  <p className="text-sm text-black/50">Instant feedback</p>
                </div>
              </div>
              <p className="mb-4 text-lg font-semibold leading-7 text-graphite">{quiz.question}</p>
              <div className="space-y-3">
                {quiz.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = quiz.answerIndex === index;
                  return (
                    <button
                      key={option}
                      onClick={() => setSelectedAnswer(index)}
                      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                        isSelected
                          ? isCorrect
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                            : "border-red-200 bg-red-50 text-red-700"
                          : "border-black/10 bg-porcelain text-black/65 hover:bg-white"
                      }`}
                    >
                      {option}
                      {isSelected && isCorrect ? <Check size={16} /> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="roadmap" className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
        <div className="rounded-[2.5rem] bg-graphite p-6 text-white shadow-soft sm:p-10">
          <div className="mb-8 max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-white/45">Roadmap</p>
            <h2 className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">Built for the full learning loop.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["OCR", "Scan Vietnamese notebooks and slides."],
              ["AI Tutor", "Explain hard concepts step by step."],
              ["Privacy", "Treat student data with care."],
              ["Classroom", "Teacher and parent tools later."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
                <p className="mb-2 font-semibold">{title}</p>
                <p className="text-sm leading-6 text-white/58">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Run TypeScript after dependencies are installed**

Run: `npm run typecheck`

Expected: no TypeScript errors.

---

### Task 5: Install dependencies and run getdesign Apple style command

**Files:**
- Modify: package lock file created by package manager.
- Potentially modify: files changed by `npx getdesign@latest add apple`.

- [ ] **Step 1: Install dependencies**

Run: `npm install`

Expected: dependencies install successfully and a lockfile is created.

- [ ] **Step 2: Run the requested Apple style command**

Run: `npx getdesign@latest add apple`

Expected: command completes successfully or reports what it changed. If it requires interactive confirmation, choose the default/recommended option unless it would overwrite existing app files without confirmation.

- [ ] **Step 3: Inspect changed files from getdesign**

Run: `ls`

Expected: project files still exist. If getdesign generated extra components/styles, review them and keep only changes that support the Apple-inspired UI.

---

### Task 6: Verify build quality

**Files:**
- Modify implementation files only if verification reveals issues.

- [ ] **Step 1: Run typecheck**

Run: `npm run typecheck`

Expected: completes with no TypeScript errors.

- [ ] **Step 2: Run build**

Run: `npm run build`

Expected: Next.js production build completes successfully.

- [ ] **Step 3: Run lint if supported by the installed Next.js version**

Run: `npm run lint`

Expected: either lint passes or Next.js reports that the lint command is not supported in the current version. If unsupported, rely on typecheck and build.

---

### Task 7: Manual UI review

**Files:**
- Modify `app/page.tsx` or `app/globals.css` only if the UI has obvious issues.

- [ ] **Step 1: Start dev server**

Run: `npm run dev`

Expected: local Next.js URL is printed.

- [ ] **Step 2: Open the app in a browser**

Open the printed local URL.

Expected visual behavior:

- Hero looks premium, spacious, and Apple-inspired.
- Mobile-sized viewport remains readable and usable.
- Study input is easy to find.
- Generate Study Pack updates the rendered summary.
- Flashcard reveal and navigation work.
- Quiz answer selection shows feedback.

- [ ] **Step 3: Stop dev server**

Stop the running dev server after inspection.

---

## Self-review

- Spec coverage: The plan covers Apple-style UI, mobile-first layout, study input, mock generation, summary, flashcards, quiz, roadmap/trust section, and verification.
- Deferred production features are explicitly excluded from this first pass.
- Placeholder scan: no TBD/TODO placeholders are present.
- Type consistency: `StudyPack`, `Flashcard`, and `QuizQuestion` names match across `lib/study-pack.ts` and `app/page.tsx`.
