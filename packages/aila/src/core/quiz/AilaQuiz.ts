import { Json } from "@oakai/core/src/models/prompts";
import { moderationResultSchema } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import { prisma } from "@oakai/db";
// TODO: double check the prisma import
import { CohereClient } from "cohere-ai";
import { z } from "zod";

import { AilaQuizService } from "..";
import {
  JsonPatchDocument,
  JsonPatchDocumentOptional,
  PatchQuiz,
} from "../../protocol/jsonPatchProtocol";
import {
  LooseLessonPlan,
  QuizQuestion,
  QuizQuestionSchema,
  QuizSchema,
} from "../../protocol/schema";
import { testInput } from "./cachedQuizOutput";

interface CustomMetadata {
  custom_id: string;
  [key: string]: unknown; // Allow for other unknown metadata fields
}

interface CustomSource {
  text: string;
  metadata: CustomMetadata;
  [key: string]: unknown; // Allow for other unknown fields at the top level
}

interface CustomHit {
  _source: CustomSource;
}

interface SimplifiedResult {
  text: string;
  custom_id: string;
}

interface Document {
  document: {
    text: string;
  };
  index: number;
  relevanceScore: number;
}

interface SimplifiedResultQuestion {
  text: string;
  questionUid: string;
}

interface Document {
  text: string;
}

interface DocumentWrapper {
  document: Document;
  index: number;
  relevanceScore: number;
}

type quizPatchType = "/starterQuiz" | "/exitQuiz";

// function extractCustomId(doc: DocumentWrapper): string | null {
// try {
//     const parsedText = JSON.parse(doc.document.text);
//     return parsedText.custom_id || null;
// } catch (error) {
//     console.error("Error parsing JSON:", error);
//     return null;
// }
// }

// Example prior knowledge "priorKnowledge":["Basic understanding of geometric shapes.","Knowledge of angles and how to measure them.","Understanding of the properties of circles, including radius, diameter, and circumference.","Familiarity with basic algebraic manipulation.","Ability to interpret and draw geometric diagrams."]
export class AilaQuiz implements AilaQuizService {
  public async generateStarterQuizArray(
    lessonPlan: LooseLessonPlan,
  ): Promise<QuizQuestion[]> {
    const quiz = testInput;
    return quiz;
  }
  public async generateExitQuizArray(
    lessonPlan: LooseLessonPlan,
  ): Promise<QuizQuestion[]> {
    const quiz = testInput;
    return quiz;
  }
  public async generateStarterQuizPatch(
    lessonPlan: LooseLessonPlan,
  ): Promise<JsonPatchDocument> {
    const quizQuestions = await this.generateStarterQuizArray(lessonPlan);
    const quizType = "/starterQuiz";

    const starterPatchObject = {
      op: "add",
      path: quizType,
      value: [
        {
          question:
            "For 6 days in a row I spend \u00a311 on my lunch. How much did I spent in total? ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707171916/km6zbhuzhbirgqpnzgfx.png)",
          answers: ["\u00a366"],
          distractors: ["\u00a316", "\u00a360", "\u00a363"],
        },
        {
          question:
            "For 6 days in a row I spend \u00a311 on my lunch. How much did I spent in total? ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707171916/km6zbhuzhbirgqpnzgfx.png)",
          answers: ["\u00a366"],
          distractors: ["\u00a316", "\u00a360", "\u00a363"],
        },
      ],
    };

    const result = PatchQuiz.safeParse(starterPatchObject);
    console.log(JSON.stringify(quizQuestions));
    // console.log("SIXTH");
    // //     // Validate against the schema
    // const result = PatchQuiz.safeParse(starterPatchObject);

    const patch: JsonPatchDocument = {
      type: "patch",
      reasoning:
        "adding maths quiz because i need to teach the kids about this",
      value: starterPatchObject,
    };

    console.log("MATHS_EXIT_QUIZ_FOLLOWING");
    console.log("FULL_QUIZ_PATCH: ", JSON.stringify(patch));
    return patch;
  }
}
