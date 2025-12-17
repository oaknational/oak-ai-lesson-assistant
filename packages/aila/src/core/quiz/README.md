# Quiz Module

The quiz module generates, enriches, and composes quiz questions for AI-generated lesson plans using a three-stage configurable pipeline architecture.

## Architecture Overview

The quiz generation system follows a three-stage pipeline where each stage is independently configurable:

```
Lesson Plan → [Sources (1+)] → [Enrichers (0+)] → [Composer (1)] → Final Quiz
```

Each stage can be configured with different strategies to experiment with quiz quality and generation approaches.

### 1. Sources (`question-sources/`)

Retrieve candidate question pools from various origins. **Multiple sources run in parallel**, each producing a pool of candidate questions:

- **BasedOnLessonSource** (`basedOnLesson`): Questions from user-specified "based on" lesson (high signal when available)
- **SimilarLessonsSource** (`similarLessons`): Questions from lessons matching title/subject/key stage
- **MultiQuerySemanticSource** (`multiQuerySemantic`): Multiple semantic searches with Cohere reranking

Each source returns a `QuizQuestionPool[]` with source metadata (e.g., which lesson, which search term).

### 2. Enrichers (`enrichers/`)

Process question pools to add metadata. **Enrichers run sequentially**, each transforming the pools:

- **ImageDescriptionEnricher** (`imageDescriptions`): Generates text descriptions of images for LLM context

Returns enriched `QuizQuestionPool[]` without modifying the originals.

### 3. Composers (`composers/`)

Select final questions from the enriched candidate pools:

- **LLMComposer** (`llm`): Uses AI to intelligently select the best questions across all pools

### Full Services (`fullservices/`)

Orchestrate the complete quiz generation pipeline:

- **buildQuizService**: Factory function that builds a `QuizService` from configuration

## Key Interfaces

- **QuizService**: Main interface for complete quiz generation services
- **QuestionSource**: Interface for sources that retrieve candidate pools
- **QuestionEnricher**: Interface for enrichers that process pools
- **QuizComposer**: Interface for composers that select final questions
- **QuizQuestionPool**: Structure containing questions + source metadata (lesson/search term)
- **RagQuizQuestion**: Core quiz question type with raw JSON data

## Usage Example

```typescript
import { buildQuizService } from "./fullservices/buildQuizService";

// Build a quiz service with the recommended pipeline
const quizService = buildQuizService({
  sources: ["basedOnLesson", "similarLessons", "multiQuerySemantic"],
  enrichers: ["imageDescriptions"],
  composer: "llm",
});

// Generate a quiz for a lesson plan
const quiz = await quizService.buildQuiz(
  "/starterQuiz",
  lessonPlan,
  similarLessons,
  task,
);
```

### Current Recommended Pipeline

```typescript
{
  sources: ["basedOnLesson", "similarLessons", "multiQuerySemantic"],
  enrichers: ["imageDescriptions"],
  composer: "llm"
}
```

This pipeline:

1. Retrieves candidates from user's source lesson (if specified), similar lessons, and semantic search
2. Enriches pools with image descriptions for better LLM context
3. Uses AI to intelligently select the best questions from all pools

## External Dependencies

- **Elasticsearch**: For retrieving existing quiz questions
  - Requires: `I_DOT_AI_ELASTIC_CLOUD_ID`, `I_DOT_AI_ELASTIC_KEY`
- **Cohere API**: For reranking documents in semantic search
  - Requires: `COHERE_API_KEY`
- **OpenAI**: For LLM-based quiz composition and image descriptions
- **Prisma**: For database access to lesson plans

## Testing

Tests follow the pattern `<FileName>.test.ts` and use Jest:

```bash
# Run all quiz tests
pnpm test quiz

# Run specific test file
pnpm test LLMQuizComposer.test.ts
```

Key test patterns:

- Mock external services (Elasticsearch, Cohere, OpenAI)
- Test quiz validation against schemas
- Verify source retrieval, enrichment, and composition logic

## Development Notes

### Adding New Sources

To add a new question source:

1. Implement `QuestionSource` interface (return `QuizQuestionPool[]`)
2. Add source type to `QuestionSourceTypeSchema` in `schema.ts`
3. Wire it up in `createSource()` function in `buildQuizService.ts`
4. Add comprehensive tests with mocked dependencies

### Adding New Enrichers

To add a new enricher:

1. Implement the `QuestionEnricher` interface (return `QuizQuestionPool[]`)
2. Add enricher type to `QuestionEnricherTypeSchema` in `schema.ts`
3. Wire it up in `createEnricher()` function in `buildQuizService.ts`
4. Add tests covering various input scenarios

### Adding New Composers

To add a new composer:

1. Implement `QuizComposer` interface
2. Add composer type to `QuizComposerTypeSchema` in `schema.ts`
3. Wire it up in `createComposer()` function in `buildQuizService.ts`
4. Add tests covering various input scenarios

## Configuration

Quiz services are configured through the `buildQuizService()` factory with options for:

- **sources**: Array of source types (`'basedOnLesson'`, `'similarLessons'`, `'multiQuerySemantic'`)
- **enrichers**: Array of enricher types (`'imageDescriptions'`)
- **composer**: Composer type (`'llm'`)

The factory pattern allows for flexible service composition and easy experimentation with different pipeline configurations.

## Question Pool Structure

Sources return structured pools with source metadata:

```typescript
interface QuizQuestionPool {
  questions: RagQuizQuestion[];
  source:
    | { type: "basedOnLesson"; lessonPlanId: string; lessonTitle: string }
    | { type: "similarLessons"; lessonPlanId: string; lessonTitle: string }
    | { type: "semanticSearch"; semanticQuery: string };
}
```

This structure allows composers to understand where each question came from and make intelligent selection decisions.
