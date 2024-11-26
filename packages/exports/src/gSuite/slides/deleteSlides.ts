import type { slides_v1 } from "@googleapis/slides";

import type { Result } from "../../types";

export type SpeakerNotesTag = "cycle1" | "cycle2" | "cycle3";

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
