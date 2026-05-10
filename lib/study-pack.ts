export type AnswerSection = {
  title: string;
  body: string;
};

export type StudyPack = {
  summary: string[];
  concepts: string[];
  sections: AnswerSection[];
};

const fallbackNote =
  "Quang hợp ở cây xanh gồm pha sáng và pha tối. Pha sáng tạo ATP và NADPH nhờ ánh sáng. Pha tối sử dụng CO2 để tạo glucose, giúp cây tích lũy năng lượng và giải phóng oxy.";

export function generateStudyPack(note: string, plan?: { summaryCount: number; sectionCount: number }): StudyPack {
  const source = note.trim() || fallbackNote;
  const sentences = source
    .split(/[.!?。]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const concepts = extractConcepts(source);
  const summaryTarget = plan?.summaryCount ?? 5;
  const sectionTarget = plan?.sectionCount ?? 6;

  const summary = sentences.slice(0, summaryTarget);
  while (summary.length < summaryTarget) {
    const concept = concepts[summary.length % concepts.length] || "chủ đề chính";
    summary.push(`${concept} cần được hiểu theo vai trò của nó trong toàn bộ nội dung.`);
  }

  const sections: AnswerSection[] = [];
  for (let i = 0; i < sectionTarget; i++) {
    const concept = concepts[i % concepts.length] || "Chủ đề chính";
    const body = sentences[i % Math.max(1, sentences.length)] || source;
    sections.push({
      title: concept,
      body,
    });
  }

  return { summary, concepts, sections };
}

function extractConcepts(text: string): string[] {
  const stopwords = new Set([
    "trong", "ngoài", "trên", "dưới", "giữa", "cùng", "với", "của", "cho", "được", "những", "các", "một", "nhiều", "đang", "dần", "rằng", "thì", "là", "và", "hoặc", "nhưng", "này", "kia", "đó", "khi", "nếu", "bởi", "vì", "nên", "vào", "ra", "từ", "đến", "con", "người", "thế", "giới", "hiện", "đại", "phần", "điều", "the", "and", "with", "that", "this", "from", "into", "about", "which", "when", "where",
  ]);

  const words = text
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((word) => word.trim().toLowerCase())
    .filter((word) => word.length > 3 && !stopwords.has(word));

  const phrases: string[] = [];
  for (let i = 0; i < words.length; i++) {
    if (words[i + 1] && words[i + 2]) phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
    if (words[i + 1]) phrases.push(`${words[i]} ${words[i + 1]}`);
    phrases.push(words[i]);
  }

  const concepts = Array.from(new Set(phrases))
    .filter((phrase) => phrase.length > 4)
    .slice(0, 12)
    .map((phrase) => phrase.charAt(0).toUpperCase() + phrase.slice(1));

  return concepts.length > 0 ? concepts : ["Chủ đề chính"];
}
