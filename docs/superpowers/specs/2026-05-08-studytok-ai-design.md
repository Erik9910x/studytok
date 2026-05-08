# StudyTok AI Design Spec

## Goal

Build a UI/UX-first MVP for StudyTok AI, a mobile-first learning app for Vietnamese students. The MVP should demonstrate how notes become a premium study pack with summary, flashcards, and quiz content.

## Approved direction

The product should use an Apple-inspired visual system rather than the earlier cyberpunk direction.

Key qualities:

- Premium and minimal.
- Spacious layout.
- Large confident typography.
- Soft off-white and graphite surfaces.
- Apple-like blue accents.
- Subtle glass, blur, gradient, and shadow effects.
- Mobile-first experience that scales to desktop.

## MVP scope

### Included

- Landing/hero section for StudyTok AI.
- Note input panel.
- Generate Study Pack button.
- Local mock study-pack generation.
- Summary card.
- Concept chips.
- Interactive flashcard card with reveal behavior.
- Interactive quiz card with selected-answer feedback.
- Trust/roadmap content covering OCR, Vietnamese-first AI, privacy, and future teacher/parent functionality.

### Excluded from first code pass

- Real OCR.
- Real LLM API.
- Authentication.
- Database.
- File upload persistence.
- Teacher dashboard.
- Parent dashboard.
- Social rooms.
- Payment system.

## Architecture

Use a small frontend-first Next.js app with TypeScript and Tailwind CSS.

Initial data flow:

```text
User enters notes
  -> local generator function creates mock StudyPack
  -> UI renders summary, flashcards, and quiz
```

Future data flow:

```text
User uploads image/text
  -> OCR adapter extracts Vietnamese text
  -> LLM adapter generates structured StudyPack JSON
  -> database/storage persists results
  -> UI renders saved study pack
```

## Components

- `AppShell`: page layout and background system.
- `HeroSection`: product positioning and primary CTA.
- `StudyInput`: textarea and generate action.
- `SummaryCard`: bullet summary and concept chips.
- `FlashcardDeck`: current card, reveal state, next/previous controls.
- `QuizCard`: options, selected answer, feedback state.
- `RoadmapSection`: future capability cards.

## Data shape

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

## Interaction behavior

- The page loads with a sample note already available so the demo is immediately usable.
- Clicking Generate Study Pack creates a study pack from the note content.
- Flashcards reveal answers on click or button press.
- Flashcard previous/next controls update the active card and reset reveal state.
- Quiz answer selection shows whether the selected answer is correct.
- Empty input should not generate a blank result; the UI should keep the user oriented with helper text.

## Testing and verification

- Install dependencies if a package scaffold is required.
- Run lint/build/typecheck scripts that exist in the generated project.
- Start the dev server if possible and inspect the UI manually.
- If any command requires network, package install, or another permission outside the current sandbox, request user approval.

## Implementation notes

The first implementation should optimize for visual quality and demo value. Real OCR and LLM work should be represented as future-ready adapter boundaries, not implemented in the first pass.
