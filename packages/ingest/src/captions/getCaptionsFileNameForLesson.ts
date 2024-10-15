import { IngestError } from "../IngestError";

export const getCaptionsFileNameForLesson = ({
  videoTitle,
}: {
  videoTitle: string | null | undefined;
}) => {
  if (!videoTitle) {
    throw new IngestError("videoTitle is required");
  }

  return `${videoTitle}.vtt`;
};
