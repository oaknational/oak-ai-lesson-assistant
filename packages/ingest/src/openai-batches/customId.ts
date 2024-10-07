import { IngestError } from "../IngestError";

type CreateCustomIdProps =
  | {
      task: "generate-lesson-plans";
      lessonId: string;
    }
  | {
      task: "embed-lesson-plan-parts";
      lessonId: string;
      partKey: string;
      lessonPlanPartId: string;
    };
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
  task: CreateCustomIdProps["task"];
  customId: string;
}) {
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
