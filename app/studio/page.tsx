"use client";

import type { StudyPack } from "@/lib/study-pack";
import { ArrowLeft, BookOpen, CheckCircle2, Download, Eye, EyeOff, Loader2, Wand2 } from "lucide-react";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

type Language = "VN" | "EN";
type FlashcardMode = "answer" | "question";
type Level = "minimal" | "short" | "medium" | "long" | "detailed";
type SettingKey = "shortenLevel" | "quizLevel" | "practiceLevel";

type GenerationSettings = Record<SettingKey, Level>;
type FocusMode = "flashcards" | "quiz";

const sampleNote =
  "Quang hợp gồm pha sáng và pha tối. Pha sáng tạo ATP và NADPH nhờ ánh sáng. Pha tối dùng CO2 để tạo glucose, giúp cây tích lũy năng lượng và giải phóng oxy.";

const moss = "#596f4e";
const mossDark = "#31402d";
const mossSoft = "#edf2e9";

const levelOptions: Level[] = ["minimal", "short", "medium", "long", "detailed"];

const defaultSettings: GenerationSettings = {
  shortenLevel: "medium",
  quizLevel: "medium",
  practiceLevel: "medium",
};

const copy = {
  VN: {
    back: "Landing",
    ready: "Groq AI sẵn sàng",
    workspace: "Không gian học AI",
    title: "Biến đoạn văn dài thành ghi chú gọn gàng, dễ học.",
    desc: "Dán văn bản hoặc ghi chú tiếng Việt vào Studio. StudyTok sẽ chia nội dung thành từng phần, rút keyword, tạo flashcard và quiz để bạn ôn nhanh hơn.",
    source: "Văn bản nguồn",
    words: "từ",
    chars: "ký tự",
    placeholder: "Dán đoạn văn, bài học hoặc ghi chú dài vào đây...",
    generating: "Đang tạo bộ ôn tập",
    generate: "Tạo bộ ôn tập",
    output: "Kết quả",
    studyPack: "Bộ ôn tập",
    summaryEmpty: "Bản tóm tắt sẽ hiện ở đây sau khi bạn bấm Tạo bộ ôn tập.",
    flashcards: "Flashcard",
    flashcardEmpty: "Flashcard sẽ được tạo tự động từ ghi chú của bạn.",
    quiz: "Quiz",
    quizEmpty: "Quiz sẽ hiện ở đây sau khi AI xử lý nội dung.",
    answer: "Đáp án",
    keywords: "Keyword",
    defaultKeywords: ["Ghi chú tiếng Việt", "Tóm tắt AI", "Ôn tập nhanh"],
    parts: "Từng phần",
    partNames: ["Phần 1 · Ý chính", "Phần 2 · Chi tiết cần nhớ", "Phần 3 · Ôn tập"],
    reveal: "Hiện đáp án",
    hide: "Ẩn đáp án",
    modeAnswer: "Học đáp án",
    modeQuestion: "Tự hỏi lại",
    noAnswer: "Bấm hiện đáp án để reveal flashcard.",
    settingsTitle: "Tùy chỉnh bộ ôn tập",
    settingsDesc: "Chọn mức độ trước khi AI phân tích nội dung.",
    shortenLevel: "Mức độ rút gọn",
    quizLevel: "Số quiz mong muốn",
    practiceLevel: "Số câu practice",
    levels: {
      minimal: "Tối thiểu",
      short: "Ngắn",
      medium: "Trung bình",
      long: "Dài",
      detailed: "Chi tiết",
    },
    cancel: "Hủy",
    start: "Bắt đầu tạo",
    focus: "Focus mode",
    close: "Đóng",
    previous: "Trước",
    next: "Tiếp",
    switchToQuiz: "Chuyển sang Quiz",
    switchToCards: "Chuyển sang Flashcard",
    exportOffline: "Xuất offline",
  },
  EN: {
    back: "Landing",
    ready: "Groq AI ready",
    workspace: "AI study workspace",
    title: "Turn long text into clean notes that are easy to study.",
    desc: "Paste Vietnamese notes or long passages into Studio. StudyTok splits the content into parts, extracts keywords, builds flashcards, and creates quizzes for faster review.",
    source: "Source text",
    words: "words",
    chars: "chars",
    placeholder: "Paste a long paragraph, lesson, or study note here...",
    generating: "Generating study pack",
    generate: "Generate study pack",
    output: "Output",
    studyPack: "Study pack",
    summaryEmpty: "Your summary will appear here after generating a study pack.",
    flashcards: "Flashcards",
    flashcardEmpty: "Flashcards will be generated from your note.",
    quiz: "Quiz",
    quizEmpty: "Quiz questions will appear after AI processes the text.",
    answer: "Answer",
    keywords: "Keywords",
    defaultKeywords: ["Vietnamese notes", "AI summary", "Quick review"],
    parts: "Parts",
    partNames: ["Part 1 · Main idea", "Part 2 · Details", "Part 3 · Review"],
    reveal: "Reveal answer",
    hide: "Hide answer",
    modeAnswer: "Study answers",
    modeQuestion: "Recall mode",
    noAnswer: "Reveal the answer to flip this flashcard.",
    settingsTitle: "Customize study pack",
    settingsDesc: "Choose how AI should analyze your text before generation.",
    shortenLevel: "Shorten level",
    quizLevel: "Quiz amount",
    practiceLevel: "Practice questions",
    levels: {
      minimal: "Minimal",
      short: "Short",
      medium: "Medium",
      long: "Long",
      detailed: "Detailed",
    },
    cancel: "Cancel",
    start: "Start generation",
    focus: "Focus mode",
    close: "Close",
    previous: "Previous",
    next: "Next",
    switchToQuiz: "Switch to Quiz",
    switchToCards: "Switch to Flashcards",
    exportOffline: "Export offline",
  },
} satisfies Record<Language, {
  back: string;
  ready: string;
  workspace: string;
  title: string;
  desc: string;
  source: string;
  words: string;
  chars: string;
  placeholder: string;
  generating: string;
  generate: string;
  output: string;
  studyPack: string;
  summaryEmpty: string;
  flashcards: string;
  flashcardEmpty: string;
  quiz: string;
  quizEmpty: string;
  answer: string;
  keywords: string;
  defaultKeywords: string[];
  parts: string;
  partNames: string[];
  reveal: string;
  hide: string;
  modeAnswer: string;
  modeQuestion: string;
  noAnswer: string;
  settingsTitle: string;
  settingsDesc: string;
  shortenLevel: string;
  quizLevel: string;
  practiceLevel: string;
  levels: Record<Level, string>;
  cancel: string;
  start: string;
  focus: string;
  close: string;
  previous: string;
  next: string;
  switchToQuiz: string;
  switchToCards: string;
  exportOffline: string;
}>;

export default function StudioPage() {
  const [language, setLanguage] = useState<Language>("VN");
  const [note, setNote] = useState(sampleNote);
  const [pack, setPack] = useState<StudyPack | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [revealedCards, setRevealedCards] = useState<number[]>([]);
  const [flashcardMode, setFlashcardMode] = useState<FlashcardMode>("answer");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<GenerationSettings>(defaultSettings);
  const [focusMode, setFocusMode] = useState<FocusMode | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const text = copy[language];

  const noteStats = useMemo(() => {
    const words = note.trim().split(/\s+/).filter(Boolean).length;
    return { words, chars: note.length };
  }, [note]);

  const parts = useMemo(() => {
    const summary = pack?.summary ?? [];

    if (summary.length === 0) {
      return [{ name: text.partNames[0], body: text.summaryEmpty }];
    }

    return summary.map((body, index) => ({
      name: text.partNames[index] ?? `${text.parts} ${index + 1}`,
      body,
    }));
  }, [pack, text.partNames, text.parts, text.summaryEmpty]);

  function openSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSettingsOpen(true);
  }

  async function generatePack() {
    setSettingsOpen(false);
    setStatus("loading");
    setError("");
    setRevealedCards([]);

    try {
      const response = await fetch("/api/study-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note, settings }),
      });
      const data = (await response.json()) as { pack?: StudyPack; error?: string };

      if (!response.ok || !data.pack) {
        throw new Error(data.error || "Không tạo được bộ ôn tập.");
      }

      setPack(data.pack);
      setStatus("idle");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Không tạo được bộ ôn tập.");
      setStatus("error");
    }
  }

  function toggleReveal(index: number) {
    setRevealedCards((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index],
    );
  }

  function exportOfflinePack() {
    if (!pack) return;

    const content = [
      "STUDYTOK - BỘ ÔN TẬP OFFLINE",
      "",
      "TÓM TẮT GỌN",
      ...pack.summary.map((item, index) => `${index + 1}. ${item}`),
      "",
      "KEYWORDS",
      ...pack.concepts.map((concept) => `- ${concept}`),
      "",
      "FLASHCARDS",
      ...pack.flashcards.map((card, index) => `Card ${index + 1}\nQ: ${card.question}\nA: ${card.answer}`),
      "",
      "QUIZ",
      ...pack.quiz.map((question, index) => [
        `Quiz ${index + 1}`,
        question.question,
        ...question.options.map((option, optionIndex) => `${String.fromCharCode(65 + optionIndex)}. ${option}`),
        `Đáp án: ${String.fromCharCode(65 + question.answerIndex)}. ${question.options[question.answerIndex]}`,
      ].join("\n")),
    ].join("\n\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "studytok-bo-on-tap.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  function openFocus(mode: FocusMode, index = 0) {
    setFocusMode(mode);
    setFocusIndex(index);
  }

  function moveFocus(direction: number) {
    const length = focusMode === "quiz" ? pack?.quiz.length ?? 0 : pack?.flashcards.length ?? 0;
    if (length === 0) return;
    setFocusIndex((current) => (current + direction + length) % length);
  }

  const focusedFlashcard = focusMode === "flashcards" ? pack?.flashcards[focusIndex] : null;
  const focusedQuiz = focusMode === "quiz" ? pack?.quiz[focusIndex] : null;
  const focusTotal = focusMode === "quiz" ? pack?.quiz.length ?? 0 : pack?.flashcards.length ?? 0;
  const focusRevealed = revealedCards.includes(focusIndex);

  return (
    <main suppressHydrationWarning className="min-h-screen bg-[#fbfaf7] text-[#1f241d]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(89,111,78,0.14),transparent_30%),radial-gradient(circle_at_82%_4%,rgba(49,64,45,0.10),transparent_24%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 lg:px-8">
        <header className="flex items-center justify-between rounded-[1.75rem] bg-white/85 px-4 py-3 shadow-[0_18px_60px_rgba(49,64,45,0.08)] backdrop-blur-xl">
          <Link href="/" className="inline-flex items-center gap-3 rounded-full px-2 py-1 text-[15px] font-medium text-[#394235] transition hover:bg-[#edf2e9]">
            <ArrowLeft size={17} />
            {text.back}
          </Link>
          <div className="flex items-center gap-2 text-[15px] font-semibold tracking-tight" style={{ color: mossDark }}>
            <span className="grid h-8 w-8 place-items-center rounded-xl text-white" style={{ backgroundColor: moss }}>
              ST
            </span>
            StudyTok Studio
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguage((current) => (current === "VN" ? "EN" : "VN"))}
              className="rounded-full px-4 py-2 text-xs font-bold text-white shadow-[0_12px_28px_rgba(89,111,78,0.24)] transition hover:scale-105 active:scale-95"
              style={{ backgroundColor: moss }}
              aria-label="Switch language"
            >
              {language === "VN" ? "EN" : "VN"}
            </button>
          </div>
        </header>

        <section className="grid flex-1 gap-6 py-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start lg:py-12">
          <div className="space-y-6">
            <div className="rounded-[2rem] bg-white p-7 shadow-[0_24px_80px_rgba(49,64,45,0.10)] lg:p-10">
              <h1 className="mt-7 max-w-2xl text-[3.35rem] font-medium leading-[0.98] tracking-[-0.052em] text-[#1f241d] lg:text-[4.35rem]">
                {text.title}
              </h1>
              <p className="mt-6 max-w-2xl text-[17px] leading-8 text-[#5f675c]">
                {text.desc}
              </p>
            </div>

            <form onSubmit={openSettings} className="rounded-[2rem] bg-white p-6 shadow-[0_24px_80px_rgba(49,64,45,0.10)] lg:p-7">
              <div className="flex items-center justify-between gap-4">
                <label htmlFor="note" className="text-[15px] font-semibold text-[#263021]">
                  {text.source}
                </label>
                <span className="rounded-full bg-[#f1f0eb] px-3 py-1 text-xs text-[#72786f]">
                  {noteStats.words} {text.words} · {noteStats.chars} {text.chars}
                </span>
              </div>
              <textarea
                id="note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="mt-4 min-h-80 w-full resize-none rounded-[1.5rem] bg-[#f6f5f0] p-5 text-[15px] leading-8 text-[#273025] outline-none transition focus:bg-[#f1f4ed]"
                placeholder={text.placeholder}
              />
              {error ? <p className="mt-3 text-sm text-[#8a3f36]">{error}</p> : null}
              <button
                type="submit"
                disabled={status === "loading"}
                className="mt-5 inline-flex items-center gap-3 rounded-full px-8 py-4 text-[15px] font-semibold text-white shadow-[0_16px_40px_rgba(89,111,78,0.25)] transition hover:scale-[1.02] active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
                style={{ backgroundColor: moss }}
              >
                {status === "loading" ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                {status === "loading" ? text.generating : text.generate}
              </button>
            </form>
          </div>

          <div className="grid gap-5">
            <section className="rounded-[2rem] bg-white p-6 shadow-[0_24px_80px_rgba(49,64,45,0.10)] lg:p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#879080]">{text.output}</p>
                  <h2 className="mt-2 text-4xl font-medium tracking-[-0.045em] text-[#1f241d]">{text.studyPack}</h2>
                </div>
                <div className="flex items-center gap-2">
                  {pack ? (
                    <button
                      type="button"
                      onClick={exportOfflinePack}
                      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-white transition hover:scale-105 active:scale-95"
                      style={{ backgroundColor: moss }}
                    >
                      <Download size={14} />
                      {text.exportOffline}
                    </button>
                  ) : null}
                  <BookOpen size={26} color={moss} />
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {parts.map((part) => (
                  <article key={part.name} className="rounded-2xl bg-[#f6f5f0] p-4 text-[15px] leading-7 text-[#565f52]">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em]" style={{ color: moss }}>
                      {part.name}
                    </p>
                    <p>{part.body}</p>
                  </article>
                ))}
              </div>
            </section>

            <div className="grid gap-5 lg:grid-cols-2">
              <section className="rounded-[2rem] bg-white p-5 shadow-[0_24px_80px_rgba(49,64,45,0.08)]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#879080]">{text.flashcards}</p>
                  <div className="flex gap-2">
                    {pack ? (
                      <button
                        type="button"
                        onClick={() => openFocus("flashcards")}
                        className="rounded-full px-3 py-1.5 text-[11px] font-bold text-white transition hover:scale-105 active:scale-95"
                        style={{ backgroundColor: moss }}
                      >
                        {text.focus}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setFlashcardMode((current) => (current === "answer" ? "question" : "answer"))}
                      className="rounded-full px-3 py-1.5 text-[11px] font-bold text-white transition hover:scale-105 active:scale-95"
                      style={{ backgroundColor: moss }}
                    >
                      {flashcardMode === "answer" ? text.modeAnswer : text.modeQuestion}
                    </button>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {(pack?.flashcards ?? []).map((card, index) => {
                    const revealed = revealedCards.includes(index);
                    return (
                      <article key={`${index}-${card.question}`} className="rounded-2xl bg-[#f6f5f0] p-4">
                        <p className="text-[15px] font-semibold leading-6 text-[#263021]">
                          {flashcardMode === "answer" ? card.question : card.answer}
                        </p>
                        <div className="mt-3 rounded-xl bg-white/75 p-3 text-sm leading-6 text-[#65705f]">
                          {revealed ? (flashcardMode === "answer" ? card.answer : card.question) : text.noAnswer}
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleReveal(index)}
                          className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-white transition hover:scale-105 active:scale-95"
                          style={{ backgroundColor: moss }}
                        >
                          {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
                          {revealed ? text.hide : text.reveal}
                        </button>
                      </article>
                    );
                  })}
                  {!pack ? <p className="text-[15px] leading-7 text-[#65705f]">{text.flashcardEmpty}</p> : null}
                </div>
              </section>

              <section className="rounded-[2rem] bg-white p-5 shadow-[0_24px_80px_rgba(49,64,45,0.08)]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#879080]">{text.quiz}</p>
                  {pack ? (
                    <button
                      type="button"
                      onClick={() => openFocus("quiz")}
                      className="rounded-full px-3 py-1.5 text-[11px] font-bold text-white transition hover:scale-105 active:scale-95"
                      style={{ backgroundColor: moss }}
                    >
                      {text.focus}
                    </button>
                  ) : null}
                </div>
                <div className="mt-4 space-y-3">
                  {(pack?.quiz ?? []).map((question, index) => (
                    <article key={`${index}-${question.question}`} className="rounded-2xl bg-[#f6f5f0] p-4">
                      <p className="text-[15px] font-semibold leading-6 text-[#263021]">{question.question}</p>
                      <p className="mt-2 text-sm leading-6 text-[#65705f]">
                        {text.answer}: {question.options[question.answerIndex]}
                      </p>
                    </article>
                  ))}
                  {!pack ? <p className="text-[15px] leading-7 text-[#65705f]">{text.quizEmpty}</p> : null}
                </div>
              </section>
            </div>

            <section className="rounded-[2rem] p-5 text-white shadow-[0_24px_80px_rgba(49,64,45,0.12)]" style={{ backgroundColor: mossDark }}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">{text.keywords}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(pack?.concepts ?? text.defaultKeywords).map((concept) => (
                  <span key={concept} className="rounded-full bg-white/12 px-3 py-2 text-xs text-white/85">
                    {concept}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>

      {focusMode ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#1f241d]/35 px-4 backdrop-blur-xl">
          <div className="w-full max-w-3xl rounded-[2rem] bg-white p-6 shadow-[0_30px_120px_rgba(31,36,29,0.28)] lg:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#879080]">
                  {focusMode === "quiz" ? text.quiz : text.flashcards} · {focusIndex + 1}/{focusTotal}
                </p>
                <h2 className="mt-2 text-4xl font-medium tracking-[-0.045em] text-[#1f241d]">{text.focus}</h2>
              </div>
              <button
                type="button"
                onClick={() => setFocusMode(null)}
                className="rounded-full bg-[#f1f0eb] px-4 py-2 text-sm font-semibold text-[#59615a] transition hover:scale-105 active:scale-95"
              >
                {text.close}
              </button>
            </div>

            <div className="mt-6 rounded-[1.5rem] bg-[#f6f5f0] p-6 lg:p-8">
              {focusMode === "flashcards" && focusedFlashcard ? (
                <div>
                  <p className="text-2xl font-semibold leading-snug text-[#263021] lg:text-3xl">
                    {flashcardMode === "answer" ? focusedFlashcard.question : focusedFlashcard.answer}
                  </p>
                  <div className="mt-6 rounded-2xl bg-white p-5 text-lg leading-8 text-[#5f675c]">
                    {focusRevealed ? (flashcardMode === "answer" ? focusedFlashcard.answer : focusedFlashcard.question) : text.noAnswer}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleReveal(focusIndex)}
                    className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:scale-105 active:scale-95"
                    style={{ backgroundColor: moss }}
                  >
                    {focusRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                    {focusRevealed ? text.hide : text.reveal}
                  </button>
                </div>
              ) : null}

              {focusMode === "quiz" && focusedQuiz ? (
                <div>
                  <p className="text-2xl font-semibold leading-snug text-[#263021] lg:text-3xl">{focusedQuiz.question}</p>
                  <div className="mt-6 grid gap-3">
                    {focusedQuiz.options.map((option, index) => (
                      <div
                        key={`${index}-${option}`}
                        className="rounded-2xl p-4 text-base font-medium"
                        style={{
                          backgroundColor: index === focusedQuiz.answerIndex ? mossSoft : "#ffffff",
                          color: index === focusedQuiz.answerIndex ? mossDark : "#5f675c",
                        }}
                      >
                        {String.fromCharCode(65 + index)}. {option}
                      </div>
                    ))}
                  </div>
                  <p className="mt-5 text-sm font-semibold" style={{ color: moss }}>
                    {text.answer}: {focusedQuiz.options[focusedQuiz.answerIndex]}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setFocusMode(focusMode === "quiz" ? "flashcards" : "quiz")}
                className="rounded-full bg-[#f1f0eb] px-5 py-3 text-sm font-semibold text-[#59615a] transition hover:scale-105 active:scale-95"
              >
                {focusMode === "quiz" ? text.switchToCards : text.switchToQuiz}
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => moveFocus(-1)}
                  className="rounded-full bg-[#f1f0eb] px-5 py-3 text-sm font-semibold text-[#59615a] transition hover:scale-105 active:scale-95"
                >
                  {text.previous}
                </button>
                <button
                  type="button"
                  onClick={() => moveFocus(1)}
                  className="rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:scale-105 active:scale-95"
                  style={{ backgroundColor: moss }}
                >
                  {text.next}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {settingsOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#1f241d]/35 px-4 backdrop-blur-xl">
          <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-[0_30px_120px_rgba(31,36,29,0.28)] lg:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#879080]">AI Settings</p>
                <h2 className="mt-2 text-3xl font-medium tracking-[-0.045em] text-[#1f241d]">{text.settingsTitle}</h2>
                <p className="mt-2 text-[15px] leading-7 text-[#65705f]">{text.settingsDesc}</p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {([
                ["shortenLevel", text.shortenLevel],
                ["quizLevel", text.quizLevel],
                ["practiceLevel", text.practiceLevel],
              ] as Array<[SettingKey, string]>).map(([key, label]) => (
                <div key={key}>
                  <p className="mb-3 text-sm font-semibold text-[#263021]">{label}</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {levelOptions.map((level) => {
                      const active = settings[key] === level;
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setSettings((current) => ({ ...current, [key]: level }))}
                          className="rounded-2xl px-3 py-3 text-xs font-bold transition hover:scale-[1.02] active:scale-[0.98]"
                          style={{
                            backgroundColor: active ? moss : mossSoft,
                            color: active ? "#ffffff" : mossDark,
                          }}
                        >
                          {text.levels[level]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="rounded-full bg-[#f1f0eb] px-5 py-3 text-sm font-semibold text-[#59615a] transition hover:scale-105 active:scale-95"
              >
                {text.cancel}
              </button>
              <button
                type="button"
                onClick={generatePack}
                className="rounded-full px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(89,111,78,0.25)] transition hover:scale-105 active:scale-95"
                style={{ backgroundColor: moss }}
              >
                {text.start}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
