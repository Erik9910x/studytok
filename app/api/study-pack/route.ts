import { NextResponse } from "next/server";
import type { StudyPack } from "@/lib/study-pack";
import { generateStudyPack } from "@/lib/study-pack";
import { analyzeContent } from "@/lib/content-analyzer";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-oss-120b";
const DEFAULT_FALLBACK_MODEL = "openai/gpt-oss-20b";
const DEFAULT_MAX_NOTE_CHARS = 12000;

type Level = "minimal" | "short" | "medium" | "long" | "detailed";

type StudyPackSettings = {
  shortenLevel: Level;
  quizLevel: Level;
  practiceLevel: Level;
};

type OutputPlan = {
  summaryCount: number;
  sectionCount: number;
  outputLevel: Level;
  complexity: string;
  complexityScore: number;
  analysisBrief: string;
};

const levelLabels: Record<Level, string> = {
  minimal: "tối thiểu",
  short: "ngắn",
  medium: "trung bình",
  long: "dài",
  detailed: "chi tiết",
};

const summaryCounts: Record<Level, number> = {
  minimal: 3,
  short: 4,
  medium: 5,
  long: 7,
  detailed: 9,
};

const sectionCounts: Record<Level, number> = {
  minimal: 3,
  short: 4,
  medium: 6,
  long: 8,
  detailed: 10,
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { note?: unknown; settings?: unknown };
    const note = typeof body.note === "string" ? body.note.trim() : "";
    const settings = normalizeSettings(body.settings);
    const maxChars = getMaxNoteChars();

    if (!note) {
      return NextResponse.json({ error: "Note is required." }, { status: 400 });
    }

    if (note.length > maxChars) {
      return NextResponse.json({ error: `Note is too long. Maximum is ${maxChars} characters.` }, { status: 413 });
    }

    const analysis = analyzeContent(note);
    const plan = createOutputPlan(settings, analysis);
    const keys = getGroqKeys();

    if (keys.length === 0) {
      return NextResponse.json({ pack: resizeStudyPack(generateStudyPack(note, plan), plan), source: "local-fallback", plan, warning: "GROQ_API_KEYS is not configured." });
    }

    const models = Array.from(new Set([process.env.GROQ_MODEL || DEFAULT_MODEL, process.env.GROQ_FALLBACK_MODEL || DEFAULT_FALLBACK_MODEL]));
    const errors: string[] = [];

    for (const model of models) {
      for (const apiKey of keys) {
        try {
          const pack = await requestStudyPack({ apiKey, model, note, settings, plan });
          return NextResponse.json({ pack: resizeStudyPack(pack, plan), source: "groq", model, plan });
        } catch (error) {
          errors.push(error instanceof Error ? error.message : "Unknown Groq error");
        }
      }
    }

    return NextResponse.json(
      { pack: resizeStudyPack(generateStudyPack(note, plan), plan), source: "local-fallback", plan, warning: "Groq failed; returned local fallback.", detail: errors.at(-1) },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}

function createStudyPackSchema(plan: OutputPlan) {
  return {
    type: "object",
    additionalProperties: false,
    required: ["summary", "concepts", "sections"],
    properties: {
      summary: {
        type: "array",
        minItems: plan.summaryCount,
        maxItems: plan.summaryCount,
        items: { type: "string" },
      },
      concepts: {
        type: "array",
        minItems: 8,
        maxItems: 16,
        items: { type: "string" },
      },
      sections: {
        type: "array",
        minItems: plan.sectionCount,
        maxItems: plan.sectionCount,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["title", "body"],
          properties: {
            title: { type: "string" },
            body: { type: "string" },
          },
        },
      },
    },
  } as const;
}

function normalizeSettings(value: unknown): StudyPackSettings {
  const raw = value as Partial<Record<keyof StudyPackSettings, unknown>>;

  return {
    shortenLevel: normalizeLevel(raw?.shortenLevel),
    quizLevel: normalizeLevel(raw?.quizLevel),
    practiceLevel: normalizeLevel(raw?.practiceLevel),
  };
}

function normalizeLevel(value: unknown): Level {
  return typeof value === "string" && value in summaryCounts ? (value as Level) : "medium";
}

function createOutputPlan(settings: StudyPackSettings, analysis: ReturnType<typeof analyzeContent>): OutputPlan {
  const outputLevel = settings.shortenLevel;

  return {
    summaryCount: summaryCounts[outputLevel],
    sectionCount: sectionCounts[settings.practiceLevel],
    outputLevel,
    complexity: analysis.complexity,
    complexityScore: analysis.complexityScore,
    analysisBrief: [
      `${analysis.wordCount} words`,
      `${analysis.sentenceCount} sentences`,
      analysis.hasDefinitions ? "definitions" : "no definitions",
      analysis.hasProcesses ? "process" : "no process",
      analysis.hasComparisons ? "comparison" : "no comparison",
      analysis.hasCauses ? "cause-effect" : "no cause-effect",
    ].join(", "),
  };
}

function resizeStudyPack(pack: StudyPack, plan: OutputPlan): StudyPack {
  return {
    summary: ensureStrings(pack.summary, plan.summaryCount),
    concepts: ensureConcepts(pack.concepts),
    sections: ensureSections(pack.sections, plan.sectionCount),
  };
}

function ensureStrings(items: unknown[], count: number): string[] {
  const values = items.slice(0, count).map(String).filter(Boolean);
  while (values.length < count) values.push(`Nội dung bổ sung ${values.length + 1} cần được hiểu trong mạch chính của văn bản.`);
  return values;
}

function ensureConcepts(items: unknown[]): string[] {
  const values = Array.from(new Set(items.map(String).filter(Boolean))).slice(0, 16);
  while (values.length < 8) values.push(`Thuật ngữ bổ sung ${values.length + 1}`);
  return values;
}

function ensureSections(items: StudyPack["sections"], count: number): StudyPack["sections"] {
  const values = items.slice(0, count).map((section) => ({ title: String(section.title), body: String(section.body) }));
  while (values.length < count) values.push({ title: `Mục bổ sung ${values.length + 1}`, body: "Mục này cần được nối lại với chủ đề chính của văn bản." });
  return values;
}

function getGroqKeys(): string[] {
  return (process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "")
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
}

function getMaxNoteChars(): number {
  const parsed = Number(process.env.MAX_NOTE_CHARS);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_NOTE_CHARS;
}

async function requestStudyPack({
  apiKey,
  model,
  note,
  settings,
  plan,
}: {
  apiKey: string;
  model: string;
  note: string;
  settings: StudyPackSettings;
  plan: OutputPlan;
}): Promise<StudyPack> {
  const response = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "Bạn là engine xử lý dữ liệu học liệu đa lĩnh vực. Không tạo flashcard, không tạo quiz. Nhiệm vụ là biến input thành bộ câu trả lời có cấu trúc: tóm tắt cân đối, thuật ngữ, các mục giải thích logic. Trả về JSON đúng schema, không markdown, không text ngoài JSON.",
        },
        {
          role: "user",
          content: `INPUT:\n${note}\n\nOUTPUT PLAN:\n- summary level: ${levelLabels[settings.shortenLevel]}\n- detail level: ${levelLabels[settings.practiceLevel]}\n- analysis: ${plan.analysisBrief}\n- complexity: ${plan.complexity} (${plan.complexityScore}/100)\n- summary items: EXACTLY ${plan.summaryCount}\n- answer sections: EXACTLY ${plan.sectionCount}\n- concepts: 8-16\n\nRULES:\n1. First infer domain/topic and structure of INPUT.\n2. Summary must compress the whole text without losing core meaning. Longer output means more depth, not shorter fragmented filler.\n3. Concepts must be real terms/ideas from INPUT, not stopwords, not generic words.\n4. Sections are the main product. Each section needs a concrete title naming what it explains.\n5. Section titles must NOT be \"Phần 1\", \"Mục 2\", \"Chi tiết\", \"Ôn tập\", \"Ý chính\", or any numbered filler.\n6. Section bodies must explain what that title means, why it matters, and how it connects to the whole input.\n7. Balance output: do not over-expand trivial details; do not shrink important concepts just to hit count.\n8. If INPUT is short, deepen explanation around the same real topic instead of inventing unrelated material.\n9. Vietnamese output unless INPUT is clearly English.`,
        },
      ],
      temperature: 0.25,
      max_completion_tokens: 4500,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "study_pack",
          strict: true,
          schema: createStudyPackSchema(plan),
        },
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Groq ${response.status}: ${text.slice(0, 240)}`);
  }

  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Groq returned an empty response.");
  }

  return normalizeStudyPack(JSON.parse(content));
}

function normalizeStudyPack(value: unknown): StudyPack {
  const pack = value as StudyPack;

  if (!Array.isArray(pack.summary) || !Array.isArray(pack.concepts) || !Array.isArray(pack.sections)) {
    throw new Error("Groq returned an invalid study pack shape.");
  }

  return {
    summary: pack.summary.slice(0, 9).map(String),
    concepts: pack.concepts.slice(0, 16).map(String),
    sections: pack.sections.slice(0, 10).map((section) => ({
      title: String(section.title),
      body: String(section.body),
    })),
  };
}
