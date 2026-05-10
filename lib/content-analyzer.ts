/**
 * Content Analyzer - Phân tích văn bản thông minh
 * Tự động xác định độ phức tạp và điều chỉnh output
 */

export type ContentComplexity = "very_simple" | "simple" | "moderate" | "complex" | "very_complex";

export type ContentAnalysis = {
  // Thông tin cơ bản
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;

  // Độ phức tạp
  complexity: ContentComplexity;
  complexityScore: number; // 0-100

  // Phân loại nội dung
  hasDefinitions: boolean;
  hasExamples: boolean;
  hasComparisons: boolean;
  hasProcesses: boolean;
  hasCauses: boolean;

  // Khái niệm chính
  keyTerms: string[];
  technicalTerms: string[];

  // Đề xuất số lượng output
  recommendedSummaryCount: number;
  recommendedQuizCount: number;
  recommendedFlashcardCount: number;
};

/**
 * Phân tích văn bản đầu vào
 */
export function analyzeContent(text: string): ContentAnalysis {
  const cleaned = text.trim();

  // Đếm cơ bản
  const words = cleaned.split(/\s+/).filter(Boolean);
  const sentences = cleaned.split(/[.!?。]+/).filter(s => s.trim().length > 0);
  const paragraphs = cleaned.split(/\n\n+/).filter(p => p.trim().length > 0);

  const wordCount = words.length;
  const sentenceCount = Math.min(sentences.length, Math.max(1, Math.ceil(wordCount / 8)));
  const paragraphCount = Math.max(1, paragraphs.length);

  // Tính complexity score
  const complexityScore = calculateComplexityScore(cleaned, wordCount, sentenceCount);
  const complexity = getComplexityLevel(complexityScore);

  // Phát hiện đặc điểm nội dung
  const hasDefinitions = detectDefinitions(cleaned);
  const hasExamples = detectExamples(cleaned);
  const hasComparisons = detectComparisons(cleaned);
  const hasProcesses = detectProcesses(cleaned);
  const hasCauses = detectCauses(cleaned);

  // Trích xuất khái niệm
  const keyTerms = extractKeyTerms(cleaned, wordCount);
  const technicalTerms = extractTechnicalTerms(cleaned);

  // Tính toán số lượng output đề xuất
  const recommended = calculateRecommendedCounts(
    wordCount,
    sentenceCount,
    complexityScore,
    { hasDefinitions, hasExamples, hasComparisons, hasProcesses, hasCauses }
  );

  return {
    wordCount,
    sentenceCount,
    paragraphCount,
    complexity,
    complexityScore,
    hasDefinitions,
    hasExamples,
    hasComparisons,
    hasProcesses,
    hasCauses,
    keyTerms,
    technicalTerms,
    recommendedSummaryCount: recommended.summary,
    recommendedQuizCount: recommended.quiz,
    recommendedFlashcardCount: recommended.flashcard,
  };
}

/**
 * Tính complexity score (0-100)
 */
function calculateComplexityScore(text: string, wordCount: number, sentenceCount: number): number {
  let score = 0;

  // 1. Độ dài văn bản (0-25 điểm)
  if (wordCount < 50) score += 5;
  else if (wordCount < 100) score += 10;
  else if (wordCount < 200) score += 15;
  else if (wordCount < 400) score += 20;
  else score += 25;

  // 2. Độ dài câu trung bình (0-20 điểm)
  const avgSentenceLength = wordCount / Math.max(1, sentenceCount);
  if (avgSentenceLength < 8) score += 5;
  else if (avgSentenceLength < 12) score += 10;
  else if (avgSentenceLength < 18) score += 15;
  else score += 20;

  // 3. Từ vựng phức tạp (0-25 điểm)
  const complexWords = text.match(/\b\w{10,}\b/g)?.length || 0;
  const complexWordRatio = complexWords / Math.max(1, wordCount);
  score += Math.min(25, complexWordRatio * 500);

  // 4. Cấu trúc câu phức tạp (0-15 điểm)
  const commas = (text.match(/,/g) || []).length;
  const semicolons = (text.match(/;/g) || []).length;
  const colons = (text.match(/:/g) || []).length;
  const punctuationScore = (commas * 0.5 + semicolons * 2 + colons * 1.5) / Math.max(1, sentenceCount);
  score += Math.min(15, punctuationScore * 3);

  // 5. Thuật ngữ chuyên môn (0-15 điểm)
  const technicalPatterns = [
    /\b[A-Z]{2,}\b/g, // Viết tắt: DNA, ATP, CO2
    /\b\w+tion\b/gi, // Từ kết thúc -tion
    /\b\w+ology\b/gi, // Từ kết thúc -ology
    /\b\w+ism\b/gi, // Từ kết thúc -ism
  ];
  let technicalCount = 0;
  technicalPatterns.forEach(pattern => {
    technicalCount += (text.match(pattern) || []).length;
  });
  score += Math.min(15, (technicalCount / Math.max(1, wordCount)) * 300);

  return Math.min(100, Math.round(score));
}

/**
 * Xác định mức độ phức tạp
 */
function getComplexityLevel(score: number): ContentComplexity {
  if (score < 20) return "very_simple";
  if (score < 40) return "simple";
  if (score < 60) return "moderate";
  if (score < 80) return "complex";
  return "very_complex";
}

/**
 * Phát hiện định nghĩa
 */
function detectDefinitions(text: string): boolean {
  const patterns = [
    /\b(là|nghĩa là|được định nghĩa|có nghĩa|được gọi là|chính là)\b/i,
    /\b(is|means|defined as|refers to|known as)\b/i,
  ];
  return patterns.some(p => p.test(text));
}

/**
 * Phát hiện ví dụ
 */
function detectExamples(text: string): boolean {
  const patterns = [
    /\b(ví dụ|chẳng hạn|như|thí dụ|minh họa)\b/i,
    /\b(example|such as|for instance|like|e\.g\.)\b/i,
  ];
  return patterns.some(p => p.test(text));
}

/**
 * Phát hiện so sánh
 */
function detectComparisons(text: string): boolean {
  const patterns = [
    /\b(so với|khác với|giống|tương tự|trái ngược|hơn|kém)\b/i,
    /\b(compared to|versus|unlike|similar|different|than)\b/i,
  ];
  return patterns.some(p => p.test(text));
}

/**
 * Phát hiện quy trình
 */
function detectProcesses(text: string): boolean {
  const patterns = [
    /\b(quá trình|giai đoạn|bước|trước tiên|sau đó|cuối cùng|tiếp theo)\b/i,
    /\b(process|step|stage|first|then|next|finally|procedure)\b/i,
  ];
  return patterns.some(p => p.test(text));
}

/**
 * Phát hiện quan hệ nhân quả
 */
function detectCauses(text: string): boolean {
  const patterns = [
    /\b(vì|do|bởi|nên|dẫn đến|gây ra|kết quả|hậu quả|nguyên nhân)\b/i,
    /\b(because|since|due to|therefore|thus|cause|result|effect)\b/i,
  ];
  return patterns.some(p => p.test(text));
}

/**
 * Trích xuất từ khóa chính
 */
function extractKeyTerms(text: string, wordCount: number): string[] {
  // Tách từ và đếm tần suất
  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(w => w.length > 3);

  const frequency = new Map<string, number>();
  words.forEach(word => {
    frequency.set(word, (frequency.get(word) || 0) + 1);
  });

  // Lọc stopwords (từ phổ biến không mang nhiều ý nghĩa)
  const stopwords = new Set([
    "được", "của", "trong", "với", "này", "đó", "những", "các", "một", "cho",
    "the", "and", "for", "that", "this", "with", "from", "have", "are", "was",
  ]);

  // Sắp xếp theo tần suất
  const sorted = Array.from(frequency.entries())
    .filter(([word]) => !stopwords.has(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, Math.min(16, Math.ceil(wordCount / 20)))
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));

  return sorted;
}

/**
 * Trích xuất thuật ngữ chuyên môn
 */
function extractTechnicalTerms(text: string): string[] {
  const terms: string[] = [];

  // Viết hoa đầu câu (có thể là thuật ngữ)
  const capitalizedWords = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  terms.push(...capitalizedWords);

  // Viết tắt
  const acronyms = text.match(/\b[A-Z]{2,}\b/g) || [];
  terms.push(...acronyms);

  // Từ có số
  const wordsWithNumbers = text.match(/\b\w*\d+\w*\b/g) || [];
  terms.push(...wordsWithNumbers);

  // Loại trùng và giới hạn
  return Array.from(new Set(terms)).slice(0, 10);
}

/**
 * Tính toán số lượng output đề xuất dựa trên phân tích
 */
function calculateRecommendedCounts(
  wordCount: number,
  sentenceCount: number,
  complexityScore: number,
  features: {
    hasDefinitions: boolean;
    hasExamples: boolean;
    hasComparisons: boolean;
    hasProcesses: boolean;
    hasCauses: boolean;
  }
): { summary: number; quiz: number; flashcard: number } {
  // Base counts dựa trên độ dài
  let summaryBase = Math.min(9, Math.max(3, Math.ceil(sentenceCount / 2)));
  let quizBase = Math.min(20, Math.max(5, Math.ceil(wordCount / 25)));
  let flashcardBase = Math.min(30, Math.max(6, Math.ceil(wordCount / 20)));

  // Điều chỉnh theo complexity
  const complexityMultiplier = 1 + (complexityScore / 200); // 1.0 - 1.5
  summaryBase = Math.round(summaryBase * complexityMultiplier);
  quizBase = Math.round(quizBase * complexityMultiplier);
  flashcardBase = Math.round(flashcardBase * complexityMultiplier);

  // Điều chỉnh theo features
  const featureCount = Object.values(features).filter(Boolean).length;
  const featureBonus = featureCount * 0.1; // +10% per feature

  summaryBase = Math.round(summaryBase * (1 + featureBonus));
  quizBase = Math.round(quizBase * (1 + featureBonus));
  flashcardBase = Math.round(flashcardBase * (1 + featureBonus));

  // Đảm bảo trong giới hạn
  return {
    summary: Math.min(9, Math.max(3, summaryBase)),
    quiz: Math.min(20, Math.max(5, quizBase)),
    flashcard: Math.min(30, Math.max(6, flashcardBase)),
  };
}
