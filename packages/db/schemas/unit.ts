import { z } from "zod";

import { Programme } from "./programme";

export const Unit = z.object({
  id: z.number(),
  slug: z.string(),
  numberOfLessons: z.number(),
  isSensitive: z.boolean(),
  // unitQuizzes: z.array(z.unknown()),
  programmeOfStudyUnits: z.array(
    z.object({
      id: z.number(),
      programme: Programme.nullable().optional(),
    }),
  ),
  // therapyUnits: z.array(z.unknown()),
  // unitLessons: z.array(
  //   z.object({
  //     id: z.number(),
  //     positionInUnit: z.number(),
  //     lesson: z.object({
  //       id: z.number(),
  //       slug: z.string(),
  //       title: z.string(),
  //       isSensitive: z.boolean(),
  //     }),
  //   }),
  // ),
  topic: z.object({
    title: z.string(),
    id: z.number(),
    slug: z.string().nullable().optional(),
    topicType: z.object({ title: z.string() }),
  }),
});
