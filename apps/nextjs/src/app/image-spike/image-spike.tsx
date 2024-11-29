"use client";

import Link from "next/link";

const ImageSpike = ({ lessons }: { lessons: any }) => {
  const lessonTitles = lessons.map((lesson: any) => ({
    sessionId: lesson.id,
    lessonTitle: lesson?.output?.lessonPlan?.title || "",
    hasThreeCycles:
      !!lesson?.output?.lessonPlan?.cycle1 &&
      !!lesson?.output?.lessonPlan?.cycle2 &&
      !!lesson?.output?.lessonPlan?.cycle3,
  }));

  return (
    <div className="mx-auto mt-20 max-w-[1200px]">
      <h1>Choose a lesson to test</h1>
      <div className="flex flex-col gap-6">
        {lessonTitles.map(
          ({
            sessionId,
            lessonTitle,
            hasThreeCycles,
          }: {
            sessionId: string;
            lessonTitle: string;
            hasThreeCycles: boolean;
          }) => {
            if (!lessonTitle || !hasThreeCycles) {
              return null;
            }
            return (
              <Link key={sessionId} href={`/image-spike/${sessionId}`}>
                {lessonTitle}: {sessionId}
              </Link>
            );
          },
        )}
      </div>
    </div>
  );
};

export default ImageSpike;
