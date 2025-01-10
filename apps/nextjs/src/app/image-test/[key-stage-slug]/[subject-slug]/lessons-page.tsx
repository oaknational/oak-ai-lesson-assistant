"use client";

import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { z } from "zod";

const LessonsPage = ({
  lessons,
  keyStageSlug,
  subjectSlug,
}: {
  keyStageSlug: string;
  subjectSlug: string;
  lessons: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    appId: string;
    userId: string;
    output: Prisma.JsonValue;
  }[];
}) => {
  // zod parse lessons
  const lessonSchema = z
    .object({
      id: z.string(),
      createdAt: z.date(),
      updatedAt: z.date(),
      deletedAt: z.date().nullable().optional(),
      appId: z.string(),
      userId: z.string(),
      output: z.object({
        title: z.string(),
      }),
    })
    .passthrough();

  if (1 >= lessons.length) {
    return (
      <div className="mx-auto max-w-[1200px] p-19">
        <div className="mb-11">
          <Link href="/image-test">{`<- Back`}</Link>
        </div>
        <p>No lessons found</p>
      </div>
    );
  }

  const parsedLessons = lessons.map((lesson) => lessonSchema.parse(lesson));

  return (
    <div className="mx-auto max-w-[1200px] p-19">
      <div className="mb-11">
        <Link href="/image-test">{`<- Back`}</Link>
      </div>
      <h1 className="mb-11">
        Choose your keystage: {keyStageSlug}, subject: {subjectSlug}
      </h1>
      <div>
        {parsedLessons?.map((lesson) => (
          <div key={lesson.id} className="mb-5">
            <Link
              href={`/image-test/${keyStageSlug}/${subjectSlug}/${lesson.id}`}
              className="text-blue hover:underline"
            >
              {lesson.output.title}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LessonsPage;
