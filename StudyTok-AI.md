# StudyTok AI — Full App Blueprint

## 1. Product vision

StudyTok AI is a mobile-first learning app for Vietnamese students that transforms messy notes into beautiful, easy-to-review study experiences. The core promise is simple: paste, upload, or capture a lesson, then receive a polished study pack containing a summary, flashcards, and quiz questions.

The first version prioritizes UI/UX quality over production AI depth. It should feel premium, calm, and native-app-like: closer to an Apple product page and iOS learning app than a generic EdTech dashboard.

## 2. Target users

### Students
Need to review lessons quickly, especially before tests. They want short summaries, swipeable flashcards, and instant self-check quizzes.

### Teachers
Later-stage users who can generate class materials from slides or notes. Not required for the first UI-focused MVP.

### Parents
Later-stage users who can view learning progress and reminders. Not required for the first UI-focused MVP.

## 3. MVP scope

The MVP should demonstrate the product experience, not final backend intelligence.

### Included now

- Premium Apple-inspired landing experience.
- Mobile-first app shell.
- Note input area for pasted study content.
- "Generate Study Pack" interaction.
- Beautiful generated summary view.
- Flashcard review UI with question/answer reveal.
- Quiz UI with answer selection and feedback.
- Trust/roadmap section explaining OCR, Vietnamese-first AI, privacy, and future teacher mode.

### Deferred

- Real OCR integration.
- Real LLM API integration.
- Authentication.
- Database persistence.
- Teacher dashboard.
- Parent dashboard.
- Social study rooms.
- Payments/subscriptions.

## 4. UI/UX direction

The user cares most about UI/UX, so the app should optimize for visual polish and interaction quality.

### Style

- Apple-inspired, premium, clean, spacious.
- Soft gradients, glass surfaces, subtle shadows.
- Large confident typography.
- Rounded cards and iOS-like controls.
- Minimal color palette with refined accents.
- Avoid cyberpunk/neon styling.

### Color direction

- Primary background: warm off-white or very light gray.
- Dark contrast areas: graphite / near-black.
- Accent: Apple-like blue.
- Secondary accents: soft lavender, mint, and silver gradients.
- Cards: translucent white, subtle border, shadow blur.

### UX principles

- One primary action per screen section.
- Make generated learning content feel like a premium artifact.
- Keep the experience understandable even without real AI.
- Optimize for mobile first, then scale to desktop.
- Use motion/hover states sparingly and tastefully.

## 5. Proposed MVP screens

### Hero

Purpose: sell the idea immediately.

Content:

- Product name: StudyTok AI.
- Headline: turn Vietnamese notes into beautiful study packs.
- Subheadline: summary, flashcards, and quiz in seconds.
- Primary CTA: Generate a study pack.
- Secondary proof points: Vietnamese-first, OCR-ready, privacy-aware.

### Study input panel

Purpose: let users paste a note and trigger generation.

Elements:

- Large rounded textarea.
- Example note placeholder.
- Generate button.
- Small helper text explaining that OCR and real AI will be connected later.

### Generated summary

Purpose: make the AI result feel clear and useful.

Elements:

- Summary card with 3–5 concise bullets.
- Key concepts as pill chips.
- Confidence / study time estimate visual detail.

### Flashcards

Purpose: provide TikTok-like short learning moments without copying TikTok visually.

Elements:

- One large card at a time.
- Question front.
- Tap/click to reveal answer.
- Previous/next controls.
- Progress indicator.

### Quiz

Purpose: quick self-check.

Elements:

- Multiple-choice question card.
- Four answer options.
- Correct/incorrect feedback.
- Score or progress indicator.

### Roadmap/trust section

Purpose: communicate that this is a serious education product.

Elements:

- OCR for Vietnamese notes.
- Vietnamese-first AI prompts.
- Privacy and student-data care.
- Future teacher and parent tools.

## 6. Technical blueprint

### Recommended stack

- Next.js with TypeScript.
- Tailwind CSS for styling.
- Local mock generation function for the first MVP.
- Component-first structure so real APIs can be added later.

### Initial architecture

```text
User input
  -> local study-pack generator
  -> summary data
  -> flashcard data
  -> quiz data
  -> UI components
```

### Future architecture

```text
Upload image/text
  -> OCR adapter
  -> text cleanup
  -> LLM study-pack API
  -> database/storage
  -> UI rendering
```

## 7. Data model draft

```ts
type StudyPack = {
  summary: string[];
  concepts: string[];
  flashcards: Array<{
    question: string;
    answer: string;
  }>;
  quiz: Array<{
    question: string;
    options: string[];
    answerIndex: number;
  }>;
};
```

## 8. AI prompt direction for future integration

### Summary

Generate 3–5 concise Vietnamese bullet points from the provided study note. Preserve key concepts and avoid inventing facts.

### Flashcards

Generate question-answer flashcards suitable for exam review. Each answer should be short, specific, and grounded in the input.

### Quiz

Generate multiple-choice questions with four options and one correct answer. Distractors should be plausible but clearly incorrect.

### Mindmap

Generate a hierarchical outline with parent topics and child concepts.

## 9. Security and compliance notes

For a production version, StudyTok AI must treat student data carefully, especially users under 16.

- Ask for age where legally required.
- Require guardian consent for young students where applicable.
- Avoid storing original images unless necessary.
- Encrypt sensitive data in transit and at rest.
- Avoid using student content for third-party advertising.
- Add rate limits before public launch.

## 10. Build priority

1. Create polished Apple-style UI shell.
2. Add study input and local mock generation.
3. Add summary, flashcard, and quiz interactions.
4. Verify responsive behavior.
5. Later: replace mock generator with real OCR/LLM APIs.
