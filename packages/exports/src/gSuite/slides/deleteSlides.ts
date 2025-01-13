import type { slides_v1 } from "@googleapis/slides";

import type { Result } from "../../types";

// This type reflects the values available in the "speaker notes" of the template slides document
export type SpeakerNotesTag =
  | `cycle${1 | 2 | 3}`
  | `question${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20}`;

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
