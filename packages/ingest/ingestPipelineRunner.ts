import { CompletedLessonPlanSchema } from "@oakai/aila/src/protocol/schema";
import { prisma } from "@oakai/db";
import fs from "node:fs";
import { z } from "zod";

import { getBatchDataDir } from "./data/getBatchDataDir";
import { getLessonPlanParts } from "./generate-lesson-plan-parts/getLessonPlanParts";
import { lessonPlanPartsBatchFileLine } from "./generate-lesson-plan-parts/lessonPlanPartsBatchFileLine";
import { getLessonPlanBatchFileLine } from "./generate-lesson-plans/getLessonPlanBatchFileLine";
import { jsonlToArray } from "./jsonl-helpers/jsonlToArray";
import { splitJsonlByRowsOrSize } from "./jsonl-helpers/splitJsonlByRowsOrSize";
import {
  OPEN_AI_BATCH_MAX_SIZE_MB,
  OPEN_AI_BATCH_MAX_ROWS,
} from "./openai-batches/constants";
import { downloadOpenAiFile } from "./openai-batches/downloadOpenAiFile";
import { retrieveOpenAiBatch } from "./openai-batches/retrieveOpenAiBatch";
import { submitOpenAiBatch } from "./openai-batches/submitOpenAiBatch";
import { uploadOpenAiBatchFile } from "./openai-batches/uploadOpenAiBatchFile";
import { writeBatchFile } from "./openai-batches/writeBatchFile";
import {
  getCaptionsByFileName,
  getCaptionsFileNameForLesson,
} from "./transcripts/getCaptionsByFileName";
import {
  Captions,
  CaptionsSchema,
  RawLesson,
  RawLessonSchema,
} from "./zod-schema/zodSchema";

/**
 * This function checks for active ingest pipelines, and within them
 * checks for ready steps, and runs them.
 */
async function ingestPipelineRunner() {
  console.log("running ingest pipeline");
  /**
   * Get all active ingest pipelines
   */
  const activeIngests = await prisma.ingest.findMany({
    where: {
      status: "active",
    },
  });
  const ingestIds = activeIngests.map((ing) => ing.id);

  /**
   * Get all raw lessons which are ready for transcripts
   */
  const lessonsWhichNeedTranscripts = await prisma.ingestRawLesson.findMany({
    where: {
      ingestId: {
        in: ingestIds,
      },
      captionsId: {
        not: null,
      },
      status: "should_fetch_transcript",
    },
  });

  /**
   * Update status
   */
  await prisma.ingestRawLesson.updateMany({
    where: {
      id: {
        in: lessonsWhichNeedTranscripts.map((l) => l.id),
      },
    },
    data: {
      status: "fetching_trancript",
    },
  });

  /**
   * Fetch transcript for each lesson
   */
  for (const lesson of lessonsWhichNeedTranscripts) {
    const parseResult = z
      .object({ videoTitle: z.string() })
      .safeParse(lesson.data);
    if (!parseResult.success) {
      // record error
      await prisma.ingestError.create({
        data: {
          ingestId: lesson.ingestId,
          recordType: "lesson",
          recordId: lesson.id,
          stage: "fetching_transcript",
          errorMessage: "lesson data is missing",
        },
      });
      await prisma.ingestRawLesson.update({
        where: {
          id: lesson.id,
        },
        data: {
          status: "error",
        },
      });

      continue;
    }

    const fileName = getCaptionsFileNameForLesson(parseResult.data);
    // fetch transcript
    const transcript = await getCaptionsByFileName(fileName);
    // save transcript
    const transcriptRecord = await prisma.ingestLessonCaptions.create({
      data: {
        ingestId: lesson.ingestId,
        lessonId: lesson.id,
        data: transcript,
        status: "fetched",
      },
    });
    // update status
    await prisma.ingestRawLesson.update({
      where: {
        id: lesson.id,
      },
      data: {
        captionsId: transcriptRecord.id,
        status: "should_generate_lesson_plan",
      },
    });
  }

  /**
   * Get all lessons which are ready for lesson plan generation, and write request batch
   */
  const lessonsWhichNeedLessonPlans = await prisma.ingestRawLesson.findMany({
    where: {
      ingestId: {
        in: ingestIds,
      },
      status: "should_generate_lesson_plan",
    },
    include: {
      captions: true,
    },
  });
  await prisma.ingestRawLesson.updateMany({
    where: {
      id: {
        in: lessonsWhichNeedLessonPlans.map((l) => l.id),
      },
    },
    data: {
      status: "preparing_to_generate_lesson_plan",
    },
  });
  const lessonsByIngestId = lessonsWhichNeedLessonPlans.reduce(
    (
      acc: Record<
        string,
        { id: string; rawLesson: RawLesson; captions: Captions }[]
      >,
      lesson,
    ) => {
      const val = acc[lesson.ingestId] || [];
      const rawLesson = RawLessonSchema.parse(lesson.data);
      const captions = CaptionsSchema.parse(lesson?.captions?.data);
      val.push({
        id: lesson.id,
        rawLesson,
        captions,
      });
      acc[lesson.ingestId] = val;
      return acc;
    },
    {},
  );
  for (const [ingestId, lessons] of Object.entries(lessonsByIngestId)) {
    const { filePath, batchDir } = await writeBatchFile({
      ingestId,
      data: lessons,
      getBatchFileLine: getLessonPlanBatchFileLine,
    });
    const { filePaths } = await splitJsonlByRowsOrSize({
      inputFilePath: filePath,
      outputDir: batchDir,
      maxRows: OPEN_AI_BATCH_MAX_ROWS,
      maxFileSizeMB: OPEN_AI_BATCH_MAX_SIZE_MB,
    });

    // submit batches and add records in db
    for (const filePath of filePaths) {
      const { file } = await uploadOpenAiBatchFile({
        filePath,
      });
      const { batch: openaiBatch } = await submitOpenAiBatch({
        fileId: file.id,
        endpoint: "/v1/chat/completions",
      });
      const batch = await prisma.ingestOpenAiBatch.create({
        data: {
          ingestId,
          batchType: "generate_lesson_plans",
          openaiBatchId: openaiBatch.id,
          inputFilePath: filePath,
          status: "pending",
        },
      });
      /**
       * Create lesson plan records in db
       */
      await prisma.ingestLessonPlan.createMany({
        data: lessons.map((lesson) => ({
          ingestId,
          batchId: batch.id,
          lessonId: lesson.id,
          status: "generating",
        })),
      });
    }
    /**
     * Update lesson status to generating_lesson_plan
     */
    await prisma.ingestRawLesson.updateMany({
      where: {
        id: {
          in: lessons.map((l) => l.id),
        },
      },
      data: {
        status: "generating_lesson_plan",
      },
    });
  }

  /**
   * Check status of lesson plan generation batches and action
   */
  const lessonPlanBatches = await prisma.ingestOpenAiBatch.findMany({
    where: {
      ingestId: {
        in: ingestIds,
      },
      batchType: "generate_lesson_plans",
      status: "pending",
    },
  });
  for (const batch of lessonPlanBatches) {
    const { batch: openaiBatch } = await retrieveOpenAiBatch({
      batchId: batch.openaiBatchId,
    });
    switch (openaiBatch.status) {
      case "validating":
      case "in_progress":
      case "finalizing":
        break;

      case "completed":
        {
          if (!openaiBatch.output_file_id) {
            // handle error
            break;
          }
          const { file } = await downloadOpenAiFile({
            fileId: openaiBatch.output_file_id,
          });
          const text = await file.text();
          const batchDir = getBatchDataDir({ ingestId: batch.ingestId });
          // Save it to a JSONL file
          const filePath = `${batchDir}/lesson_plans_${batch.id}.jsonl`;
          fs.writeFileSync(filePath, text, "utf-8");
          console.log(`File saved to ${filePath}`);

          await prisma.ingestOpenAiBatch.update({
            where: {
              id: batch.id,
            },
            data: {
              status: "completed",
              outputFilePath: filePath,
            },
          });
        }
        break;

      default:
        // handle error
        break;
    }
  }
  /**
   * Get completed lesson plan batches, parse them and update accordingly
   */
  const completedLessonPlanBatches = await prisma.ingestOpenAiBatch.findMany({
    where: {
      ingestId: {
        in: ingestIds,
      },
      batchType: "generate_lesson_plans",
      status: "completed",
    },
  });
  const CompletionBatchResponseSchema = z.object({
    id: z.string(),
    custom_id: z.string(),
    response: z.object({
      request_id: z.string(),
      body: z.object({
        choices: z.array(
          z.object({
            message: z.object({
              content: z.string(),
            }),
          }),
        ),
      }),
    }),
    error: z.unknown(),
  });

  for (const batch of completedLessonPlanBatches) {
    const filePath = batch.outputFilePath;
    if (!filePath) {
      // handle error
      continue;
    }
    const results = await jsonlToArray({
      filePath,
      transformLine: (line) => {
        try {
          const json = JSON.parse(line);
          const parsed = CompletionBatchResponseSchema.parse(json);
          if (parsed.error) {
            return {
              error: parsed.error,
              line,
            };
          }
          const maybeLessonPlanString =
            parsed.response.body.choices?.[0]?.message?.content;
          if (!maybeLessonPlanString) {
            return {
              error: new Error("No lesson content found"),
              line,
            };
          }
          const maybeLessonPlanJson = JSON.parse(maybeLessonPlanString);
          const lessonPlan =
            CompletedLessonPlanSchema.parse(maybeLessonPlanJson);

          // hack to remove basedOn at this stage
          delete lessonPlan.basedOn;

          return {
            lessonPlan,
            lessonId: parsed.custom_id,
          };
        } catch (error) {
          return {
            error,
            line,
          };
        }
      },
    });

    for (const result of results) {
      if (result.error) {
        // handle error
        continue;
      }
      const { lessonPlan, lessonId } = result;
      await prisma.ingestLessonPlan.updateMany({
        where: {
          batchId: batch.id,
          lessonId,
        },
        data: {
          status: "should_generate_parts",
          data: lessonPlan,
        },
      });
    }
  }

  /**
   * Get lessons which have lesson plans generated, and are ready for parts
   */
  const lessonPlanRecords = await prisma.ingestLessonPlan.findMany({
    where: {
      ingestLesson: {
        ingestId: {
          in: ingestIds,
        },
        status: "should_generate_parts",
      },
    },
  });
  console.log(`Generating parts for ${lessonPlanRecords.length} lesson plans`);
  for (const lessonPlanRecord of lessonPlanRecords) {
    const lessonPlan = CompletedLessonPlanSchema.parse(lessonPlanRecord.data);
    const parts = getLessonPlanParts({ lessonPlan });
    await prisma.$transaction(async (prisma) => {
      // create the parts
      await prisma.ingestLessonPlanPart.createMany({
        data: parts.map((part) => ({
          lessonPlanId: lessonPlanRecord.id,
          ingestId: lessonPlanRecord.ingestId,
          lessonId: lessonPlanRecord.lessonId,
          batchId: lessonPlanRecord.batchId,
          key: part.key,
          textContent: part.content,
          data: part.json,
          status: "ready_to_embed",
        })),
      });
      // update status on the lesson
      await prisma.ingestLessonPlan.update({
        where: {
          id: lessonPlanRecord.id,
        },
        data: {
          status: "should_embed_parts",
        },
      });
    });
    console.log(`Generated parts for lesson ${lessonPlanRecord.lessonId}`);
  }

  /**
   * Get parts which are ready to embed, and write request batch
   */
  const partsWhichNeedEmbedding = await prisma.ingestLessonPlanPart.findMany({
    where: {
      ingestId: {
        in: ingestIds,
      },
      status: "ready_to_embed",
    },
  });

  const partsByIngestId = partsWhichNeedEmbedding.reduce(
    (
      acc: Record<
        string,
        { lessonPlanId: string; key: string; textContent: string }[]
      >,
      part,
    ) => {
      const val = acc[part.ingestId] || [];
      const { lessonPlanId, key, textContent } = part;
      val.push({ lessonPlanId, key, textContent });
      acc[part.ingestId] = val;
      return acc;
    },
    {},
  );

  for (const [ingestId, parts] of Object.entries(partsByIngestId)) {
    const { filePath, batchDir } = await writeBatchFile({
      ingestId,
      data: parts,
      getBatchFileLine: (part) => lessonPlanPartsBatchFileLine(part),
    });
    const { filePaths } = await splitJsonlByRowsOrSize({
      inputFilePath: filePath,
      outputDir: batchDir,
      maxRows: OPEN_AI_BATCH_MAX_ROWS,
      maxFileSizeMB: OPEN_AI_BATCH_MAX_SIZE_MB,
    });

    // submit batches and add records in db
    for (const filePath of filePaths) {
      const { file } = await uploadOpenAiBatchFile({
        filePath,
      });
      const { batch: openaiBatch } = await submitOpenAiBatch({
        fileId: file.id,
        endpoint: "/v1/embeddings",
      });
      const batch = await prisma.ingestOpenAiBatch.create({
        data: {
          ingestId,
          batchType: "generate_lesson_plan_parts",
          openaiBatchId: openaiBatch.id,
          inputFilePath: filePath,
          status: "pending",
        },
      });
      /**
       * Update parts status to generating
       */
      await prisma.ingestLessonPlanPart.updateMany({
        where: {
          ingestId,
          status: "ready_to_embed",
        },
        data: {
          status: "generating",
          batchId: batch.id,
        },
      });
    }
  }

  /**
   * Check status of lesson plan generation batches and action
   */
  const embeddingsBatches = await prisma.ingestOpenAiBatch.findMany({
    where: {
      ingestId: {
        in: ingestIds,
      },
      batchType: "generate_lesson_plan_parts",
      status: "pending",
    },
  });
  for (const batch of embeddingsBatches) {
    const { batch: openaiBatch } = await retrieveOpenAiBatch({
      batchId: batch.openaiBatchId,
    });
    switch (openaiBatch.status) {
      case "validating":
      case "in_progress":
      case "finalizing":
        break;

      case "completed":
        {
          if (!openaiBatch.output_file_id) {
            // handle error
            break;
          }
          const { file } = await downloadOpenAiFile({
            fileId: openaiBatch.output_file_id,
          });
          const text = await file.text();
          const batchDir = getBatchDataDir({ ingestId: batch.ingestId });
          // Save it to a JSONL file
          const filePath = `${batchDir}/lesson_plans_${batch.id}.jsonl`;
          fs.writeFileSync(filePath, text, "utf-8");
          console.log(`File saved to ${filePath}`);

          await prisma.ingestOpenAiBatch.update({
            where: {
              id: batch.id,
            },
            data: {
              status: "completed",
              outputFilePath: filePath,
            },
          });
        }
        break;

      default:
        // handle error
        break;
    }
  }

  /**
   * Get completed lesson plan batches, parse them and update accordingly
   */
  const completedEmbeddingsBatches = await prisma.ingestOpenAiBatch.findMany({
    where: {
      ingestId: {
        in: ingestIds,
      },
      batchType: "generate_lesson_plan_parts",
      status: "completed",
    },
  });
  const EmbeddingsBatchResponseSchema = z.object({
    id: z.string(),
    custom_id: z.string(),
    response: z.object({
      request_id: z.string(),
      body: z.object({
        data: z.array(
          z.object({
            embedding: z.array(z.number()),
          }),
        ),
      }),
    }),
    error: z.unknown(),
  });

  for (const batch of completedEmbeddingsBatches) {
    const filePath = batch.outputFilePath;
    if (!filePath) {
      // handle error
      continue;
    }
    const results = await jsonlToArray({
      filePath,
      transformLine: (
        line,
      ):
        | { error: unknown; line: string }
        | { embedding: number[]; lessonPlanId: string; key: string } => {
        try {
          const json = JSON.parse(line);
          const parsed = EmbeddingsBatchResponseSchema.parse(json);
          if (parsed.error) {
            return {
              error: parsed.error,
              line,
            };
          }
          const maybeEmbedding = parsed.response.body.data?.[0]?.embedding;
          if (!maybeEmbedding) {
            return {
              error: new Error("No embedding found"),
              line,
            };
          }

          const [lessonPlanId, key] = parsed.custom_id.split("-");

          if (!lessonPlanId || !key) {
            return {
              error: new Error("Malformed custom_id"),
              line,
            };
          }

          return {
            embedding: maybeEmbedding,
            lessonPlanId,
            key,
          };
        } catch (error) {
          return {
            error,
            line,
          };
        }
      },
    });

    for (const result of results) {
      if ("error" in result) {
        // handle error
        continue;
      }
      const { embedding, lessonPlanId, key } = result;
      const vector = `[${embedding.join(",")}]`;
      const res = await prisma.$executeRaw`
        UPDATE ingest_lesson_plan_part
        SET embedding = ${vector}::vector 
        SET status = 'embedded'
        WHERE lesson_plan_id = ${lessonPlanId} AND key = ${key}`;

      if (res !== 1) {
        // handle error
        continue;
      }
    }
  }
}
