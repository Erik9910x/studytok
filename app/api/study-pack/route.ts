import { NextResponse } from "next/server";
import type { StudyPack } from "@/lib/study-pack";
import { generateStudyPack } from "@/lib/study-pack";

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

const quizCounts: Record<Level, number> = {
  minimal: 5,
  short: 8,
  medium: 12,
  long: 16,
  detailed: 20,
};

const practiceCounts: Record<Level, number> = {
  minimal: 6,
  short: 10,
  medium: 15,
  long: 22,
  detailed: 30,
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

    const keys = getGroqKeys();
    if (keys.length === 0) {
      return NextResponse.json({ pack: resizeStudyPack(generateStudyPack(note), settings), source: "local-fallback", warning: "GROQ_API_KEYS is not configured." });
    }

    const models = Array.from(new Set([process.env.GROQ_MODEL || DEFAULT_MODEL, process.env.GROQ_FALLBACK_MODEL || DEFAULT_FALLBACK_MODEL]));
    const errors: string[] = [];

    for (const model of models) {
      for (const apiKey of keys) {
        try {
          const pack = await requestStudyPack({ apiKey, model, note, settings });
          return NextResponse.json({ pack: resizeStudyPack(pack, settings), source: "groq", model });
        } catch (error) {
          errors.push(error instanceof Error ? error.message : "Unknown Groq error");
        }
      }
    }

    return NextResponse.json(
      { pack: resizeStudyPack(generateStudyPack(note), settings), source: "local-fallback", warning: "Groq failed; returned local fallback.", detail: errors.at(-1) },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}

function createStudyPackSchema(settings: StudyPackSettings) {
  const summaryCount = summaryCounts[settings.shortenLevel];
  const flashcardCount = practiceCounts[settings.practiceLevel];
  const quizCount = quizCounts[settings.quizLevel];

  return {
    type: "object",
    additionalProperties: false,
    required: ["summary", "concepts", "flashcards", "quiz"],
    properties: {
      summary: {
        type: "array",
        minItems: summaryCount,
        maxItems: summaryCount,
        items: { type: "string" },
      },
      concepts: {
        type: "array",
        minItems: 8,
        maxItems: 16,
        items: { type: "string" },
      },
      flashcards: {
        type: "array",
        minItems: flashcardCount,
        maxItems: flashcardCount,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["question", "answer"],
          properties: {
            question: { type: "string" },
            answer: { type: "string" },
          },
        },
      },
      quiz: {
        type: "array",
        minItems: quizCount,
        maxItems: quizCount,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["question", "options", "answerIndex"],
          properties: {
            question: { type: "string" },
            options: {
              type: "array",
              minItems: 4,
              maxItems: 4,
              items: { type: "string" },
            },
            answerIndex: {
              type: "integer",
              minimum: 0,
              maximum: 3,
            },
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

function resizeStudyPack(pack: StudyPack, settings: StudyPackSettings): StudyPack {
  return {
    summary: pack.summary.slice(0, summaryCounts[settings.shortenLevel]),
    concepts: pack.concepts.slice(0, 16),
    flashcards: pack.flashcards.slice(0, practiceCounts[settings.practiceLevel]),
    quiz: pack.quiz.slice(0, quizCounts[settings.quizLevel]),
  };
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
}: {
  apiKey: string;
  model: string;
  note: string;
  settings: StudyPackSettings;
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
            "You create Vietnamese study packs from user notes. The JSON schema exact-count constraints are mandatory. You must fully populate every required array to its exact minItems/maxItems count. Never return fewer summary parts, quiz questions, or flashcards than requested. Return only valid JSON that matches the provided schema. Do not include markdown.",
        },
        {
          role: "user",
          content: `Create a study pack from this note.

User settings:
- Shorten/detail level: ${levelLabels[settings.shortenLevel]} (${summaryCounts[settings.shortenLevel]} summary parts)
- Quiz amount: ${levelLabels[settings.quizLevel]} (${quizCounts[settings.quizLevel]} quiz questions)
- Practice question amount: ${levelLabels[settings.practiceLevel]} (${practiceCounts[settings.practiceLevel]} flashcards)

Requirements:
- Write in Vietnamese unless the source note is clearly English.
- Summary must contain EXACTLY ${summaryCounts[settings.shortenLevel]} items. Each item should be useful, not a filler sentence.
- Quiz must contain EXACTLY ${quizCounts[settings.quizLevel]} questions with 4 options each.
- Flashcards must contain EXACTLY ${practiceCounts[settings.practiceLevel]} cards.
- If the note is short, create additional useful recall/application questions from the same concepts instead of returning fewer items.

Note:
${note}`,
        },
      ],
      temperature: 0.2,
      max_completion_tokens: 6500,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "study_pack",
          strict: true,
          schema: createStudyPackSchema(settings),
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

  if (!Array.isArray(pack.summary) || !Array.isArray(pack.concepts) || !Array.isArray(pack.flashcards) || !Array.isArray(pack.quiz)) {
    throw new Error("Groq returned an invalid study pack shape.");
  }

  return {
    summary: pack.summary.slice(0, 9).map(String),
    concepts: pack.concepts.slice(0, 16).map(String),
    flashcards: pack.flashcards.slice(0, 30).map((card) => ({
      question: String(card.question),
      answer: String(card.answer),
    })),
    quiz: pack.quiz.slice(0, 20).map((question) => ({
      question: String(question.question),
      options: question.options.slice(0, 4).map(String),
      answerIndex: Math.min(3, Math.max(0, Number(question.answerIndex) || 0)),
    })),
  };
}
