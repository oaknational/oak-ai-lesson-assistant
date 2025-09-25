import type { slides_v1 } from "@googleapis/slides";

import type { Result } from "../../types";

function getSpeakerNotesText(slide: slides_v1.Schema$Page): string {
  const notesPage = slide.slideProperties?.notesPage;
  const speakerNotesObjectId = notesPage?.notesProperties?.speakerNotesObjectId;

  if (!speakerNotesObjectId) {
    return "";
  }

  const speakerNotesElement = notesPage?.pageElements?.find(
    (el) => el.objectId === speakerNotesObjectId,
  );

  return (speakerNotesElement?.shape?.text?.textElements ?? [])
    .map((te) => te.textRun?.content)
    .join("");
}

function removeInternalTags(text: string): string {
  // Remove HTML comment style internal tags
  return text
    .replace(/<!-- INTERNAL_TAG: \w+ -->/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function clearSpeakerNoteTags({
  googleSlides,
  presentationId,
}: {
  googleSlides: slides_v1.Slides;
  presentationId: string;
}): Promise<Result<null>> {
  try {
    const response = await googleSlides.presentations.get({
      presentationId,
    });

    const requests: slides_v1.Schema$Request[] = [];

    for (const slide of response?.data?.slides ?? []) {
      const notesPage = slide.slideProperties?.notesPage;
      const speakerNotesObjectId =
        notesPage?.notesProperties?.speakerNotesObjectId;

      if (!speakerNotesObjectId) {
        continue;
      }

      const originalText = getSpeakerNotesText(slide);
      const cleanedText = removeInternalTags(originalText);

      if (originalText !== cleanedText) {
        // Delete all existing text
        requests.push({
          deleteText: {
            objectId: speakerNotesObjectId,
            textRange: {
              type: "ALL",
            },
          },
        });

        // Insert cleaned text if there's any content left
        if (cleanedText.length > 0) {
          requests.push({
            insertText: {
              objectId: speakerNotesObjectId,
              insertionIndex: 0,
              text: cleanedText,
            },
          });
        }
      }
    }

    if (requests.length > 0) {
      await googleSlides.presentations.batchUpdate({
        presentationId,
        requestBody: {
          requests,
        },
      });
    }

    return { data: null };
  } catch (error) {
    return {
      error,
      message: "Failed to clear speaker notes template tags",
    };
  }
}
