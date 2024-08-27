import { Flex, Grid, Heading } from "@radix-ui/themes";
import { LessonPlannerAppState } from "ai-apps/lesson-planner/state/types";
import { QuizAppState } from "ai-apps/quiz-designer/state/types";
import Link from "next/link";

import { Icon } from "@/components/Icon";
import { constructOwaLessonUrl } from "@/utils/constructOwaLessonUrl";
import { trpc } from "@/utils/trpc";

type SuggestedLessonProps = {
  state: QuizAppState | LessonPlannerAppState;
  queryForLookUp: string;
};

const SuggestedLessons = ({
  state,
  queryForLookUp,
}: Readonly<SuggestedLessonProps>) => {
  const keyStage = state.keyStage;
  const subject = state.subject;
  const numberOfResults = 6;

  const { data: lessonSummaries, isLoading: lessonSummariesLoading } =
    trpc.lessonSummary.searchForRelevantLessons.useQuery(
      { q: queryForLookUp, keyStage, subject, numberOfResults },
      { refetchOnWindowFocus: false },
    );

  if (lessonSummariesLoading) {
    return (
      <>
        <Heading as="h3" size="6" mt="7" mb="5">
          Suggested Lessons
        </Heading>
        <p>Loading...</p>
      </>
    );
  }
  return (
    <>
      <Heading as="h3" size="6" mt="7" mb="5">
        Suggested Lessons
      </Heading>

      <Flex className="" mb="9">
        {lessonSummaries && lessonSummaries.length > 0 && (
          <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap={"7"}>
            {lessonSummaries?.map((summary) => {
              if (
                summary?.keyStageSlug &&
                summary.subjectSlug &&
                summary.unit &&
                summary.lesson
              ) {
                const url = `https://www.thenational.academy${constructOwaLessonUrl(
                  summary.keyStageSlug,
                  summary.subjectSlug,
                  summary.unit.slug,
                  summary.lesson.slug,
                )}`;
                return (
                  <Link
                    // See notes in constructURL
                    href={url}
                    key={summary.lesson.id}
                    className=" rounded bg-pupilsPink p-12 hover:opacity-90"
                    target="_blank"
                  >
                    <span className="flex flex-col gap-9">
                      <Flex justify="between" align="center">
                        <p className="text-sm">
                          {keyStage}, {subject}, Lesson
                        </p>
                        <Icon icon="external" size="sm" />
                      </Flex>

                      <p className="font-bold">{summary.lesson.title}</p>
                      <p className="text-sm">
                        {summary.content && limitParagraph(summary.content)}
                      </p>
                    </span>
                  </Link>
                );
              }
            })}
          </Grid>
        )}
      </Flex>
    </>
  );
};

function limitParagraph(text: string): string {
  const words = text ? text.split(" ") : [];
  const truncatedWords = words.slice(0, 40);
  const truncatedText = truncatedWords.join(" ");

  if (words.length > 30) {
    return truncatedText + "...";
  } else {
    return truncatedText;
  }
}

export default SuggestedLessons;
