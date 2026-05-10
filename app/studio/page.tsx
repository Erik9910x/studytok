"use client";

import type { StudyPack } from "@/lib/study-pack";
import { ArrowLeft, BookOpen, CheckCircle2, Download, Loader2, Wand2 } from "lucide-react";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

type Language = "VN" | "EN";
type Level = "minimal" | "short" | "medium" | "long" | "detailed";
type SettingKey = "shortenLevel" | "quizLevel" | "practiceLevel";

type GenerationSettings = Record<SettingKey, Level>;

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
    desc: "Dán văn bản hoặc ghi chú tiếng Việt vào Studio. StudyTok sẽ xử lý dữ liệu, rút thuật ngữ và tạo bộ câu trả lời có cấu trúc để học dễ hiểu hơn.",
    source: "Văn bản nguồn",
    words: "từ",
    chars: "ký tự",
    placeholder: "Dán đoạn văn, bài học hoặc ghi chú dài vào đây...",
    generating: "Đang tạo bộ ôn tập",
    generate: "Tạo bộ ôn tập",
    output: "Kết quả",
    studyPack: "Bộ ôn tập",
    summaryEmpty: "Bản tóm tắt sẽ hiện ở đây sau khi bạn bấm Tạo bộ ôn tập.",
    flashcards: "Bộ câu trả lời",
    flashcardEmpty: "Các mục giải thích sẽ hiện ở đây sau khi AI xử lý nội dung.",
    quiz: "Phân tích",
    quizEmpty: "Phân tích sẽ hiện ở đây sau khi AI xử lý nội dung.",
    answer: "Trả lời",
    keywords: "Keyword",
    defaultKeywords: ["Ghi chú tiếng Việt", "Tóm tắt AI", "Ôn tập nhanh"],
    parts: "Tóm tắt",
    partNames: ["Tóm tắt"],
    reveal: "Hiện đáp án",
    hide: "Ẩn đáp án",
    modeAnswer: "Đọc giải thích",
    modeQuestion: "Xem thuật ngữ",
    noAnswer: "Nội dung sẽ hiện sau khi tạo bộ câu trả lời.",
    settingsTitle: "Tùy chỉnh bộ ôn tập",
    settingsDesc: "Chọn mức độ trước khi AI phân tích nội dung.",
    shortenLevel: "Mức độ rút gọn",
    quizLevel: "Độ sâu phân tích",
    practiceLevel: "Số mục giải thích",
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
    switchToQuiz: "Xem phân tích",
    switchToCards: "Xem câu trả lời",
    exportOffline: "Xuất offline",
  },
  EN: {
    back: "Landing",
    ready: "Groq AI ready",
    workspace: "AI study workspace",
    title: "Turn long text into clean notes that are easy to study.",
    desc: "Paste Vietnamese notes or long passages into Studio. StudyTok processes the content into terms and structured answer sections.",
    source: "Source text",
    words: "words",
    chars: "chars",
    placeholder: "Paste a long paragraph, lesson, or study note here...",
    generating: "Generating study pack",
    generate: "Generate study pack",
    output: "Output",
    studyPack: "Study pack",
    summaryEmpty: "Your summary will appear here after generating a study pack.",
    flashcards: "Answer sections",
    flashcardEmpty: "Explanation sections will appear after AI processes the text.",
    quiz: "Analysis",
    quizEmpty: "Analysis will appear after AI processes the text.",
    answer: "Answer",
    keywords: "Keywords",
    defaultKeywords: ["Vietnamese notes", "AI summary", "Quick review"],
    parts: "Summary",
    partNames: ["Summary"],
    reveal: "Reveal answer",
    hide: "Hide answer",
    modeAnswer: "Read explanation",
    modeQuestion: "View terms",
    noAnswer: "Content appears after generation.",
    settingsTitle: "Customize study pack",
    settingsDesc: "Choose how AI should analyze your text before generation.",
    shortenLevel: "Shorten level",
    quizLevel: "Analysis depth",
    practiceLevel: "Answer sections",
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [insideOpen, setInsideOpen] = useState(false);
  const [settings, setSettings] = useState<GenerationSettings>(defaultSettings);
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

  function exportOfflinePack() {
    if (!pack) return;

    const content = [
      "STUDYTOK - BỘ CÂU TRẢ LỜI OFFLINE",
      "",
      "TÓM TẮT",
      ...pack.summary.map((item, index) => `${index + 1}. ${item}`),
      "",
      "THUẬT NGỮ",
      ...pack.concepts.map((concept) => `- ${concept}`),
      "",
      "BỘ CÂU TRẢ LỜI",
      ...pack.sections.map((section, index) => `${index + 1}. ${section.title}\n${section.body}`),
    ].join("\n\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "studytok-bo-cau-tra-loi.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

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
              onClick={() => setInsideOpen(true)}
              className="rounded-full border border-[#596f4e]/35 bg-white px-4 py-2 text-xs font-bold text-[#596f4e] shadow-[0_12px_28px_rgba(89,111,78,0.10)] transition hover:scale-105 hover:bg-[#f7faf4] active:scale-95"
            >
              Inside StudyTok AI
            </button>
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

            <section className="rounded-[2rem] bg-white p-5 shadow-[0_24px_80px_rgba(49,64,45,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#879080]">{text.flashcards}</p>
              <div className="mt-4 space-y-3">
                {(pack?.sections ?? []).map((section, index) => (
                  <article key={`${section.title}-${index}`} className="rounded-2xl bg-[#f6f5f0] p-4">
                    <h3 className="text-[17px] font-semibold leading-6 text-[#263021]">{section.title}</h3>
                    <p className="mt-2 text-[15px] leading-7 text-[#65705f]">{section.body}</p>
                  </article>
                ))}
                {!pack ? <p className="text-[15px] leading-7 text-[#65705f]">{text.flashcardEmpty}</p> : null}
              </div>
            </section>

            <section className="rounded-[2rem] p-5 text-white shadow-[0_24px_80px_rgba(49,64,45,0.12)]" style={{ backgroundColor: mossDark }}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">{text.keywords}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(pack?.concepts ?? text.defaultKeywords).map((concept, index) => (
                  <span key={`${concept}-${index}`} className="rounded-full bg-white/12 px-3 py-2 text-xs text-white/85">
                    {concept}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>



      {insideOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#1f241d]/35 px-4 backdrop-blur-2xl">
          <div className="max-h-[85vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] bg-white/95 p-6 shadow-[0_30px_120px_rgba(31,36,29,0.28)] lg:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#879080]">Inside StudyTok AI</p>
                <h2 className="mt-2 text-4xl font-medium tracking-[-0.045em] text-[#1f241d]">Nguyên lí hoạt động</h2>
                <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#65705f]">
                  StudyTok AI xử lý văn bản thành bộ câu trả lời có cấu trúc: tóm tắt, thuật ngữ, các mục giải thích rõ ràng. Không flashcard, không quiz, không filler.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInsideOpen(false)}
                className="rounded-full bg-[#f1f0eb] px-4 py-2 text-sm font-semibold text-[#59615a] transition hover:scale-105 active:scale-95"
              >
                {text.close}
              </button>
            </div>

            <div className="mt-7 grid gap-4 lg:grid-cols-3">
              {[
                ["1", "Analyze", "Đọc input, đếm từ/câu, nhận diện độ phức tạp, definition, example, comparison, process, cause-effect."],
                ["2", "Plan", "Tạo output plan: số summary, số section, mức chi tiết, complexity score, analysis brief."],
                ["3", "Generate", "Gọi AI bằng JSON schema bắt buộc để trả đúng summary, concepts và sections."],
              ].map(([step, title, body]) => (
                <article key={step} className="rounded-3xl bg-[#f6f5f0] p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: moss }}>{step}</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-[#263021]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#65705f]">{body}</p>
                </article>
              ))}
            </div>

            <section className="mt-7 rounded-3xl bg-[#f6f5f0] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#879080]">3. Source map</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-[#263021]">
                {language === "VN" ? "Cấu trúc source dạng cây" : "Collapsible source tree"}
              </h3>
              <div className="mt-4 rounded-2xl border border-[#dfe6da] bg-[#fbfaf7] p-4 font-mono text-sm text-[#31402d]">
                <details open>
                  <summary className="cursor-pointer list-none font-bold text-[#263021]">▾ studytok/</summary>
                  <div className="ml-4 mt-2 space-y-2 border-l border-[#dfe6da] pl-4">
                    <details open>
                      <summary className="cursor-pointer list-none font-semibold">▾ app/</summary>
                      <div className="ml-4 mt-2 space-y-2 border-l border-[#dfe6da] pl-4">
                        <details>
                          <summary className="cursor-pointer list-none">▸ api/study-pack/</summary>
                          <div className="ml-4 mt-2 border-l border-[#dfe6da] pl-4">
                            <p>└── route.ts <span className="font-sans text-[#65705f]">— API: validate, analyze, plan, call Groq, normalize output</span></p>
                          </div>
                        </details>
                        <details>
                          <summary className="cursor-pointer list-none">▸ studio/</summary>
                          <div className="ml-4 mt-2 border-l border-[#dfe6da] pl-4">
                            <p>└── page.tsx <span className="font-sans text-[#65705f]">— Studio UI: input, settings, answer sections, source popup</span></p>
                          </div>
                        </details>
                        <p>├── page.tsx <span className="font-sans text-[#65705f]">— landing page</span></p>
                        <p>└── layout.tsx <span className="font-sans text-[#65705f]">— app shell, metadata, fonts</span></p>
                      </div>
                    </details>

                    <details open>
                      <summary className="cursor-pointer list-none font-semibold">▾ lib/</summary>
                      <div className="ml-4 mt-2 space-y-1 border-l border-[#dfe6da] pl-4">
                        <p>├── content-analyzer.ts <span className="font-sans text-[#65705f]">— content stats, complexity, feature detection</span></p>
                        <p>└── study-pack.ts <span className="font-sans text-[#65705f]">— StudyPack types, fallback, term extraction</span></p>
                      </div>
                    </details>

                    <details>
                      <summary className="cursor-pointer list-none font-semibold">▸ docs/</summary>
                      <div className="ml-4 mt-2 border-l border-[#dfe6da] pl-4">
                        <p>└── STUDYTOK_AI_PRINCIPLES.md <span className="font-sans text-[#65705f]">— nguyên lí vận hành + source map</span></p>
                      </div>
                    </details>

                    <p>├── package.json <span className="font-sans text-[#65705f]">— scripts and dependencies</span></p>
                    <p>└── next.config.ts <span className="font-sans text-[#65705f]">— Next.js config</span></p>
                  </div>
                </details>
              </div>
            </section>

            <section className="mt-7 grid gap-4 lg:grid-cols-2">
              <article className="rounded-3xl bg-[#f6f5f0] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#879080]">
                  {language === "VN" ? "Nguyên tắc thiết kế" : "Design principles"}
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#263021]">
                  {language === "VN" ? "Bám nội dung, có cấu trúc, dễ đọc" : "Grounded, structured, readable"}
                </h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-[#65705f]">
                  <li>• {language === "VN" ? "Mỗi mục phải bám vào văn bản gốc." : "Ground every section in the original input."}</li>
                  <li>• {language === "VN" ? "Tiêu đề phải gọi đúng khái niệm đang được giải thích." : "Use clear titles that name the concept being explained."}</li>
                  <li>• {language === "VN" ? "Giữ lại định nghĩa, quy trình, so sánh và quan hệ nguyên nhân - kết quả." : "Preserve definitions, processes, comparisons, and cause-effect links."}</li>
                  <li>• {language === "VN" ? "Tăng độ chi tiết mà không làm vỡ nghĩa của nội dung." : "Scale detail by depth setting without fragmenting the meaning."}</li>
                </ul>
              </article>
              <article className="rounded-3xl bg-[#f6f5f0] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#879080]">
                  {language === "VN" ? "Kiểm tra chất lượng" : "Quality checklist"}
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#263021]">
                  {language === "VN" ? "Trước khi output hiển thị lên UI" : "Before output reaches the UI"}
                </h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-[#65705f]">
                  <li>• {language === "VN" ? "JSON phải khớp schema bắt buộc." : "JSON shape must match the schema exactly."}</li>
                  <li>• {language === "VN" ? "Tóm tắt, thuật ngữ và các mục giải thích phải đúng số lượng yêu cầu." : "Summary, concepts, and sections must meet the requested counts."}</li>
                  <li>• {language === "VN" ? "Thuật ngữ được lọc trùng và loại bỏ từ yếu." : "Terms are deduplicated and filtered for weak vocabulary."}</li>
                  <li>• {language === "VN" ? "Các mục được normalize để UI luôn nhận dữ liệu ổn định." : "Sections are normalized so the UI always receives stable data."}</li>
                </ul>
              </article>
            </section>
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
