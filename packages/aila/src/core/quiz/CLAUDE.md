# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quiz Module Architecture

The quiz module is responsible for generating, evaluating, and selecting quiz questions for AI-generated lesson plans. It uses a three-stage architecture:

### 1. Generators (`generators/`)
Generate quiz questions from various sources:
- **AilaRagQuizGenerator**: Retrieves questions from Elasticsearch based on lesson content
- **BasedOnRagQuizGenerator**: Creates questions based on existing RAG lessons
- **MLQuizGenerator**: Uses machine learning models to generate questions
- All extend **BaseQuizGenerator** which provides common search and retrieval functionality

### 2. Rerankers (`rerankers/`)
Evaluate and rank generated quiz questions:
- **SchemaReranker**: Uses structured output schemas to rate quiz quality
- **ReturnFirstReranker**: Simple reranker that returns the first quiz
- **BasedOnRagAilaQuizReranker**: Specialized reranker for RAG-based quizzes
- All implement **AilaQuizReranker** interface

### 3. Selectors (`selectors/`)
Select the best quiz from ranked options:
- **SimpleQuizSelector**: Uses rating functions to pick the highest-rated quiz
- All implement **QuizSelector** interface

### Full Services (`fullservices/`)
Orchestrate the complete quiz generation pipeline:
- **BaseFullQuizService**: Abstract base class combining generators, rerankers, and selectors
- **BasedOnQuizService**: Implementation for "based on" quiz generation
- **CompositeFullQuizService**: Combines multiple quiz services

## Key Interfaces

- **QuizQuestionWithRawJson**: Core quiz question type with raw JSON data
- **AilaQuizGeneratorService**: Interface for quiz generators
- **AilaQuizReranker**: Interface for quiz rerankers
- **QuizSelector**: Interface for quiz selectors
- **FullQuizService**: Interface for complete quiz services

## External Dependencies

- **Elasticsearch**: For retrieving existing quiz questions (requires `I_DOT_AI_ELASTIC_CLOUD_ID` and `I_DOT_AI_ELASTIC_KEY`)
- **Cohere API**: For reranking documents (requires `COHERE_API_KEY`)
- **OpenAI**: For LLM-based quiz evaluation
- **Prisma**: For database access to lesson plans

## Testing

Tests follow the pattern `<FileName>.test.ts` and use Jest. Key test patterns:
- Mock external services (Elasticsearch, Cohere, OpenAI)
- Test quiz validation against schemas
- Verify quiz generation, reranking, and selection logic

## Data Flow

1. Lesson plan → Generator retrieves/creates quiz questions
2. Quiz questions → Reranker evaluates and scores each quiz
3. Scored quizzes → Selector picks the best quiz based on ratings
4. Best quiz → Returned as JSON patch for lesson plan update