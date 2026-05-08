"use client";

import { BookOpen, Wand2 } from "lucide-react";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4";

const pills = ["Ghi chú thành tóm tắt", "Flashcard AI", "Quiz thông minh"];

function BloomMark({ size = "h-8 w-8" }: { size?: string }) {
  return (
    <div className={`${size} relative shrink-0 rounded-full bg-white/10`} aria-hidden="true">
      <div className="absolute left-1/2 top-[12%] h-[46%] w-[26%] -translate-x-1/2 rounded-full bg-white/90" />
      <div className="absolute left-[18%] top-[36%] h-[34%] w-[28%] rotate-[-38deg] rounded-full bg-white/70" />
      <div className="absolute right-[18%] top-[36%] h-[34%] w-[28%] rotate-[38deg] rounded-full bg-white/70" />
      <div className="absolute bottom-[15%] left-1/2 h-[28%] w-[18%] -translate-x-1/2 rounded-full bg-white/55" />
    </div>
  );
}

function IconCircle({ children }: { children: React.ReactNode }) {
  return <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">{children}</span>;
}

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black font-display text-white">
      <video
        className="fixed inset-0 z-0 h-full w-full object-cover"
        src={VIDEO_URL}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-[1] bg-black/25" />
      <div className="fixed inset-0 z-[1] bg-[radial-gradient(circle_at_35%_42%,rgba(255,255,255,0.16),transparent_34%),linear-gradient(90deg,rgba(0,0,0,0.54),rgba(0,0,0,0.08)_55%,rgba(0,0,0,0.42))]" />

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <section className="relative flex min-h-screen w-full flex-col px-4 py-4 lg:w-[52%] lg:px-6 lg:py-6">
          <div className="liquid-glass-strong absolute inset-4 rounded-3xl lg:inset-6" />

          <nav className="relative z-10 flex items-center justify-between px-4 py-3 lg:px-5">
            <a href="#" className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95">
              <BloomMark />
              <span className="text-2xl font-semibold tracking-tighter text-white">StudyTok</span>
            </a>
          </nav>

          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 text-center">
            <BloomMark size="h-20 w-20" />
            <h1 className="mt-8 max-w-4xl text-6xl font-medium leading-[0.9] tracking-[-0.05em] text-white lg:text-7xl">
              Biến ghi chú rối <br />
              thành <span className="font-serif italic text-white/80">bộ ôn tập</span> bằng AI
            </h1>

            <a
              href="/studio"
              className="liquid-glass-strong mt-10 rounded-full px-10 py-5 text-base font-semibold text-white shadow-[0_18px_60px_rgba(0,0,0,0.22)] transition-transform hover:scale-105 active:scale-95 lg:text-lg"
            >
              Mở StudyTok Studio
            </a>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              {pills.map((pill) => (
                <span key={pill} className="liquid-glass rounded-full px-4 py-2 text-xs text-white/80">
                  {pill}
                </span>
              ))}
            </div>
          </div>

          <div className="relative z-10 px-4 pb-5 text-center lg:px-8">
            <div className="liquid-glass mx-auto max-w-xl rounded-3xl px-5 py-5">
              <p className="text-xs uppercase tracking-widest text-white/50">Không gian học tập AI</p>
              <p className="mt-3 text-2xl font-medium tracking-[-0.04em] text-white lg:text-3xl">
                Tóm tắt, flashcard và quiz trong một <span className="font-serif italic text-white/80">studio</span> học tập.
              </p>
              <div className="mx-auto mt-5 flex max-w-sm items-center gap-4 text-[11px] uppercase tracking-[0.22em] text-white/50">
                <span className="h-px flex-1 bg-white/30" />
                Vận hành bởi Groq AI
                <span className="h-px flex-1 bg-white/30" />
              </div>
            </div>
          </div>
        </section>

        <section className="relative hidden min-h-screen w-[48%] flex-col px-6 py-6 lg:flex">
          <div className="liquid-glass mt-auto rounded-[2.5rem] p-4">
            <div className="grid grid-cols-2 gap-4">
              <article className="liquid-glass rounded-3xl p-5">
                <IconCircle><Wand2 size={15} /></IconCircle>
                <h2 className="mt-10 text-2xl font-medium tracking-[-0.05em] text-white">Tạo bộ ôn tập</h2>
                <p className="mt-2 text-xs leading-5 text-white/60">AI biến ghi chú thô thành tóm tắt rõ ràng và thẻ học dễ ôn.</p>
              </article>
              <article className="liquid-glass rounded-3xl p-5">
                <IconCircle><BookOpen size={15} /></IconCircle>
                <h2 className="mt-10 text-2xl font-medium tracking-[-0.05em] text-white">Kho ôn tập</h2>
                <p className="mt-2 text-xs leading-5 text-white/60">Lưu các bộ ôn tập đã tạo để học lại theo từng phiên rõ ràng.</p>
              </article>
            </div>

            <article className="liquid-glass mt-4 rounded-3xl p-5">
              <h2 className="text-xl font-medium tracking-[-0.05em] text-white">Hiểu ghi chú tiếng Việt</h2>
              <p className="mt-2 text-xs leading-5 text-white/60">StudyTok hiểu nội dung tiếng Việt và chuyển thành tài liệu ôn tập tập trung.</p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
