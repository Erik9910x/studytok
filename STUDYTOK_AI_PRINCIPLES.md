# Inside StudyTok AI

StudyTok AI biến một đoạn văn bản bất kỳ thành bộ câu trả lời có cấu trúc: dễ đọc, đúng trọng tâm, có thuật ngữ, có phần giải thích rõ ràng, không còn flashcard/quiz rác.

---

## 1. Mục tiêu

StudyTok AI tập trung vào 4 việc:

1. Hiểu văn bản đầu vào.
2. Rút ra thuật ngữ và ý chính thật sự quan trọng.
3. Chia nội dung thành các mục giải thích hợp lý.
4. Trả output cân đối, không filler, không chia “Phần 1 / Phần 2” vô nghĩa.

Output tốt phải giúp người học trả lời được:

- Đoạn này nói về gì?
- Có những thuật ngữ nào cần nhớ?
- Mỗi ý quan trọng nghĩa là gì?
- Vì sao ý đó quan trọng?
- Nó liên quan thế nào với toàn bộ nội dung?

---

## 2. Luồng hoạt động

```txt
User input
  ↓
Validate input
  ↓
Analyze content
  ↓
Create output plan
  ↓
Call AI API with strict JSON schema
  ↓
Normalize / validate output
  ↓
Render in Studio UI
```

### 2.1. Validate input

API kiểm tra input:

- Có tồn tại không.
- Có phải string không.
- Có rỗng sau khi trim không.
- Có vượt giới hạn ký tự không.

Nếu lỗi → trả JSON error.

### 2.2. Analyze content

`content-analyzer` đọc văn bản như dữ liệu thô và tạo metadata:

- Số từ.
- Số câu.
- Số đoạn.
- Độ phức tạp.
- Có định nghĩa không.
- Có ví dụ không.
- Có so sánh không.
- Có quy trình không.
- Có quan hệ nguyên nhân - kết quả không.
- Có thuật ngữ chuyên môn không.

### 2.3. Create output plan

API tạo `OutputPlan`:

```ts
{
  summaryCount: number;
  sectionCount: number;
  outputLevel: Level;
  complexity: string;
  complexityScore: number;
  analysisBrief: string;
}
```

`summaryCount` dựa trên mức rút gọn:

```txt
minimal  → 3
short    → 4
medium   → 5
long     → 7
detailed → 9
```

`sectionCount` dựa trên số mục giải thích:

```txt
minimal  → 3
short    → 4
medium   → 6
long     → 8
detailed → 10
```

Dài hơn không có nghĩa là chia nhỏ hơn. Dài hơn phải giải thích sâu hơn.

---

## 3. Source map

Cấu trúc source chính của StudyTok AI theo dạng cây có thể mở/đóng như VS Code.

```txt
studytok/
│
├── app/
│   ├── api/
│   │   └── study-pack/
│   │       └── route.ts              # API: validate, analyze, plan, call Groq, normalize output
│   │
│   ├── studio/
│   │   └── page.tsx                  # Studio UI: input, settings, answer sections, source popup
│   │
│   ├── page.tsx                      # Landing page
│   └── layout.tsx                    # App shell, metadata, fonts
│
├── lib/
│   ├── content-analyzer.ts           # Content stats, complexity, feature detection
│   └── study-pack.ts                 # StudyPack types, fallback, term extraction
│
├── STUDYTOK_AI_PRINCIPLES.md         # Nguyên lí vận hành + source map
├── package.json                      # Scripts and dependencies
└── next.config.ts                    # Next.js config
```

### 3.1. `app/api/study-pack/route.ts`

Nhận request từ Studio, validate input, gọi analyzer, tạo output plan, gọi Groq API, ép JSON schema, normalize output.

### 3.2. `lib/content-analyzer.ts`

Đếm từ/câu/đoạn, tính độ phức tạp, nhận diện definition/example/comparison/process/cause-effect.

### 3.3. `lib/study-pack.ts`

Định nghĩa `summary`, `concepts`, `sections`; tạo local fallback; lọc thuật ngữ cơ bản.

### 3.4. `app/studio/page.tsx`

Nhận text từ user, mở settings, gọi API, render tóm tắt, thuật ngữ, bộ câu trả lời, export offline, popup Inside StudyTok AI.

---

## 4. Output schema

AI bắt buộc trả JSON đúng dạng:

```json
{
  "summary": ["..."],
  "concepts": ["..."],
  "sections": [
    {
      "title": "...",
      "body": "..."
    }
  ]
}
```

Không markdown.
Không text ngoài JSON.
Không thiếu field.
Không sai số lượng.

---

## 5. Nguyên tắc summary

Summary phải:

- Nén toàn bộ nội dung.
- Giữ đúng ý chính.
- Không copy máy móc từng câu.
- Không chia “Phần 1 / Phần 2”.
- Không dùng nhãn “Ý chính”, “Chi tiết”, “Ghi nhớ”.
- Giữ quan hệ nguyên nhân - kết quả nếu có.
- Giữ quy trình nếu input là quy trình.
- Giữ định nghĩa nếu input có định nghĩa.

Ví dụ tốt:

```txt
Trí tuệ nhân tạo đang trở thành công cụ quan trọng vì có khả năng xử lý dữ liệu lớn và hỗ trợ tự động hóa nhiều hoạt động trong đời sống.
```

Ví dụ xấu:

```txt
Phần 1: Ý chính
```

---

## 6. Nguyên tắc thuật ngữ

`concepts` phải là từ/cụm từ có nghĩa thật sự.

Không lấy stopword như:

```txt
Trong
Này
Đó
Điều
Phần
Một
Các
Những
```

Ví dụ tốt:

```txt
Trí tuệ nhân tạo
Xử lý dữ liệu
Tự động hóa
Cá nhân hóa học tập
Hệ thống đề xuất
```

---

## 7. Nguyên tắc sections

`sections` là phần quan trọng nhất.

Mỗi section có:

```ts
{
  title: string;
  body: string;
}
```

Title phải nói rõ mục đó giải thích cái gì.

Ví dụ tốt:

```txt
Vai trò của trí tuệ nhân tạo trong đời sống hiện đại
```

```txt
Xử lý dữ liệu và tự động hóa công việc
```

Ví dụ xấu:

```txt
Phần 1
Chi tiết cần nhớ
Ôn tập phần 3
Mục bổ sung 4
```

Body phải giải thích:

- Khái niệm đó là gì.
- Vì sao nó quan trọng.
- Nó liên quan thế nào tới toàn bộ input.
- Nếu cần, hệ quả hoặc ứng dụng.

---

## 8. Nguyên tắc cân đối output

Output cân đối nghĩa là:

- Ý quan trọng được giải thích sâu hơn.
- Ý phụ không bị phóng đại.
- Nội dung dài được gom nhóm hợp lý.
- Nội dung ngắn được làm rõ trong đúng chủ đề.
- Không tạo mục chỉ để đủ số lượng.
- Không làm dài bằng filler.
- Không làm ngắn bằng cách cắt mất ý.

Ví dụ input về AI trong học tập nên chia thành:

```txt
1. Vai trò của AI trong giáo dục
2. Xử lý dữ liệu học tập
3. Cá nhân hóa nội dung học
4. Tự động hóa công việc lặp lại
5. Lợi ích cho người học
6. Rủi ro và giới hạn
```

Không chia thành:

```txt
1. Phần 1
2. Phần 2
3. Phần 3
4. Phần 4
```

---

## 9. Những output bị cấm

AI và fallback phải tránh:

```txt
Phần 1
Phần 2
Ý chính
Chi tiết cần nhớ
Ghi nhớ
Ôn tập
Câu hỏi 1
Điều nào sau đây đúng
Nội dung chính của phần này là gì
Trong là gì
Điểm đúng nhất về Trong là gì
```

Nếu xuất hiện các dạng này, output chưa đạt.

---

## 10. Kết luận

StudyTok AI hiện là pipeline xử lý học liệu:

```txt
Văn bản thô
→ phân tích dữ liệu
→ lập kế hoạch output
→ gọi AI với schema bắt buộc
→ trả bộ câu trả lời có cấu trúc
```

Mục tiêu không phải tạo nhiều item. Mục tiêu là giúp người học hiểu nội dung rõ hơn.
