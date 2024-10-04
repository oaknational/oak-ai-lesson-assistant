export const getCaptionsFileNameForLesson = ({
  videoTitle,
}: {
  videoTitle: string;
}) => {
  return `${videoTitle}.vtt`;
};
