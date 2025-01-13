import type { slides_v1 } from "@googleapis/slides";

import type { Result } from "../../types";

export type CycleNumber = 1 | 2 | 3;

export type QuestionNumber =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20;

// This type reflects the values available in the "speaker notes" of the template slides document
export type SpeakerNotesTag =
  | `cycle${CycleNumber}`
  | `question${QuestionNumber}`;

export const QUESTION_TAGS = {
  1: "question1",
  2: "question2",
  3: "question3",
  4: "question4",
  5: "question5",
  6: "question6",
  7: "question7",
  8: "question8",
  9: "question9",
  10: "question10",
  11: "question11",
  12: "question12",
  13: "question13",
  14: "question14",
  15: "question15",
  16: "question16",
  17: "question17",
  18: "question18",
  19: "question19",
  20: "question20",
} as const satisfies Record<QuestionNumber, SpeakerNotesTag>;

export const CYCLE_TAGS = {
  1: "cycle1",
  2: "cycle2",
  3: "cycle3",
} as const satisfies Record<CycleNumber, SpeakerNotesTag>;

function getSpeakerNotes(slide: slides_v1.Schema$Page): string {
  const notesPage = slide.slideProperties?.notesPage;
  const speakerNotesObjectId = notesPage?.notesProperties?.speakerNotesObjectId;
  const speakerNotesElement = notesPage?.pageElements?.find(
    (el) => el.objectId === speakerNotesObjectId,
  );

  return (speakerNotesElement?.shape?.text?.textElements ?? [])
    .map((te) => te.textRun?.content)
    .join("");
}

export async function deleteSlides({
  googleSlides,
  presentationId,
  speakerNotesTagsToDelete,
}: {
  googleSlides: slides_v1.Slides;
  presentationId: string;
  speakerNotesTagsToDelete: SpeakerNotesTag[];
}): Promise<Result<null>> {
  try {
    if (speakerNotesTagsToDelete.length === 0) {
      return { data: null };
    }

    const response = await googleSlides.presentations.get({
      presentationId,
    });

    const mappedSlides = (response?.data?.slides ?? []).map((slide) => ({
      objectId: slide.objectId,
      speakerNotes: getSpeakerNotes(slide),
    }));

    const slidesToDelete = mappedSlides.filter((slide) =>
      speakerNotesTagsToDelete.some((tag) => slide.speakerNotes.includes(tag)),
    );

    const requests: slides_v1.Schema$Request[] = slidesToDelete.map(
      (slide) => ({
        deleteObject: {
          objectId: slide.objectId,
        },
      }),
    );

    await googleSlides.presentations.batchUpdate({
      presentationId,
      requestBody: {
        requests,
      },
    });

    return { data: null };
  } catch (error) {
    return {
      error,
      message: "Failed to delete slides",
    };
  }
}
