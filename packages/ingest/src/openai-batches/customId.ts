import { IngestError } from "../IngestError";

type GenerateLessonPlanCustomIdComponents = { lessonId: string };
type EmbedLessonPlanPartsCustomIdComponents = {
  lessonId: string;
  partKey: string;
  lessonPlanPartId: string;
};
type CreateCustomIdProps =
  | ({
      task: "generate-lesson-plans";
    } & GenerateLessonPlanCustomIdComponents)
  | ({
      task: "embed-lesson-plan-parts";
    } & EmbedLessonPlanPartsCustomIdComponents);

export type BatchTask = CreateCustomIdProps["task"];
export function createCustomId(props: CreateCustomIdProps): string {
  switch (props.task) {
    case "generate-lesson-plans":
      return `${props.lessonId}`;
    case "embed-lesson-plan-parts":
      return `${props.lessonId}-${props.partKey}-${props.lessonPlanPartId}`;
  }
}

export function parseCustomId(props: {
  task: "generate-lesson-plans";
  customId: string;
}): GenerateLessonPlanCustomIdComponents;
export function parseCustomId(props: {
  task: "embed-lesson-plan-parts";
  customId: string;
}): EmbedLessonPlanPartsCustomIdComponents;
export function parseCustomId(props: { task: BatchTask; customId: string }) {
  switch (props.task) {
    case "generate-lesson-plans":
      return {
        lessonId: props.customId,
      };
    case "embed-lesson-plan-parts": {
      const [lessonId, partKey, lessonPlanPartId] = props.customId.split("-");
      if (!lessonId || !lessonPlanPartId || !partKey) {
        throw new IngestError("Invalid customId", {
          errorDetail: props.customId,
        });
      }
      return {
        lessonId,
        partKey,
        lessonPlanPartId,
      };
    }
  }
}

export function getLessonIdFromCustomId(customId: string) {
  const lessonId = customId.split("-")[0];
  if (!lessonId) {
    throw new IngestError("Invalid customId", {
      errorDetail: customId,
    });
  }

  return lessonId;
}
