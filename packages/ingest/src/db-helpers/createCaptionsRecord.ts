import { PrismaClientWithAccelerate } from "@oakai/db";

import { getDataHash } from "../utils/getDataHash";
import { Captions } from "../zod-schema/zodSchema";

export async function createCaptionsRecord({
  prisma,
  ingestId,
  lessonId,
  captions,
}: {
  prisma: PrismaClientWithAccelerate;
  ingestId: string;
  lessonId: string;
  captions: Captions;
}) {
  await prisma.$transaction(async () => {
    const captionsRecord = await prisma.ingestLessonCaptions.create({
      data: {
        ingestId,
        lessonId,
        data: captions,
        dataHash: getDataHash(captions),
      },
    });
    await prisma.ingestLesson.update({
      where: {
        id: lessonId,
      },
      data: {
        captionsId: captionsRecord.id,
      },
    });
  });
}
