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
