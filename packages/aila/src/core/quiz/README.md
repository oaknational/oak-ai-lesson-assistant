# Quiz Module

The quiz module generates, evaluates, and selects quiz questions for AI-generated lesson plans using a three-stage pipeline architecture.

## Architecture Overview

The quiz generation system follows a three-stage pipeline:

```
Lesson Plan → [Generators] → [Rerankers] → [Selectors] → Best Quiz
```

### 1. Generators (`generators/`)

Generate quiz questions from various sources:

- **AilaRagQuizGenerator**: Retrieves questions from Elasticsearch based on lesson content
- **BasedOnRagQuizGenerator**: Creates questions based on existing RAG lessons
- **MLQuizGenerator**: Uses machine learning models to generate questions
- **BaseQuizGenerator**: Abstract base class providing common search and retrieval functionality

### 2. Rerankers (`rerankers/`)

Evaluate and rank generated quiz questions:

- **SchemaReranker**: Uses structured output schemas to rate quiz quality
- **ReturnFirstReranker**: Simple reranker that returns the first quiz
- **BasedOnRagAilaQuizReranker**: Specialized reranker for RAG-based quizzes

### 3. Selectors (`selectors/`)

Select the best quiz from ranked options:

- **SimpleQuizSelector**: Uses rating functions to pick the highest-rated quiz

### Full Services (`fullservices/`)

Orchestrate the complete quiz generation pipeline:

- **BaseFullQuizService**: Abstract base class combining generators, rerankers, and selectors
- **BasedOnQuizService**: Implementation for "based on" quiz generation
- **CompositeFullQuizService**: Combines multiple quiz services with configurable strategies

## Key Interfaces

- **FullQuizService**: Main interface for complete quiz generation services
- **AilaQuizGeneratorService**: Interface for quiz generators
- **AilaQuizReranker**: Interface for quiz rerankers
- **QuizSelector**: Interface for quiz selectors
- **QuizQuestionWithRawJson**: Core quiz question type with raw JSON data

## Usage Example

```typescript
import { CompositeFullQuizServiceBuilder } from "./fullservices/CompositeFullQuizServiceBuilder";

// Build a quiz service with specific generators and rerankers
const builder = new CompositeFullQuizServiceBuilder({
  /* dependencies */
});

const quizService = builder.build({
  quizGenerators: ["rag", "basedOnRag"],
  reranker: "schema",
  selector: "simple",
});

// Generate a quiz for a lesson plan
const quiz = await quizService.createBestQuiz(
  "/starterQuiz",
  lessonPlan,
  relevantLessons,
);
```

## External Dependencies

- **Elasticsearch**: For retrieving existing quiz questions
  - Requires: `I_DOT_AI_ELASTIC_CLOUD_ID`, `I_DOT_AI_ELASTIC_KEY`
- **Cohere API**: For reranking documents
  - Requires: `COHERE_API_KEY`
- **OpenAI**: For LLM-based quiz evaluation
- **Prisma**: For database access to lesson plans

## Testing

Tests follow the pattern `<FileName>.test.ts` and use Jest:

```bash
# Run all quiz tests
pnpm test quiz

# Run specific test file
pnpm test BaseQuizGenerator.test.ts
```

Key test patterns:

- Mock external services (Elasticsearch, Cohere, OpenAI)
- Test quiz validation against schemas
- Verify quiz generation, reranking, and selection logic

## Development Notes

### Current Architecture Issues

The module has some architectural challenges that should be considered when making changes:

1. **Large Interface Files**: `interfaces.ts` contains many interfaces - consider splitting by domain
2. **Error Handling**: Inconsistent error handling patterns - some methods throw, others return null/empty arrays
3. **Type Safety**: Some areas use loose typing (`PartialLessonPlan`) and type assertions
4. **Code Duplication**: Similar logic exists for starter vs exit quiz generation

### Best Practices

- Use the existing logging infrastructure (`aiLogger`)
- Follow schema validation patterns with Zod
- Mock external dependencies in tests
- Use the factory pattern for service configuration

### Adding New Generators

To add a new quiz generator:

1. Extend `BaseQuizGenerator` or implement `AilaQuizGeneratorService`
2. Add your generator to the `CompositeFullQuizServiceBuilder` options
3. Update the configuration types and validation
4. Add comprehensive tests with mocked dependencies

### Adding New Rerankers

To add a new reranker:

1. Implement the `AilaQuizReranker` interface
2. Add it to the service builder's reranker options
3. Ensure it handles edge cases (empty arrays, API failures)
4. Add tests covering various input scenarios

## Configuration

Quiz services are configured through the `CompositeFullQuizServiceBuilder` with options for:

- **quizGenerators**: Array of generator types (`'rag'`, `'basedOnRag'`, `'ml'`)
- **reranker**: Reranker type (`'schema'`, `'returnFirst'`, `'basedOnRag'`)
- **selector**: Selector type (`'simple'`)

The builder pattern allows for flexible service composition based on requirements.
