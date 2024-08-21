"use client";

import { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import Link from "next/link";

import {
  keyStageToTitle,
  subjectToTitle,
} from "@/components/AppComponents/Chat/chat-lessonPlanDisplay";
import LessonPlanMapToMarkDown from "@/components/AppComponents/Chat/chat-lessonPlanMapToMarkDown";
import { GuidanceRequired } from "@/components/AppComponents/Chat/guidance-required";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";

interface ShareChatProps {
  lessonPlan: LooseLessonPlan;
  creatorsName: string | null;
  moderation: PersistedModerationBase | null | undefined;
}
export default function ShareChat({
  lessonPlan,
  creatorsName,
  moderation,
}: Readonly<ShareChatProps>) {
  const keyStageSubjectTuple = [
    keyStageToTitle(lessonPlan.keyStage ?? ""),
    subjectToTitle(lessonPlan.subject ?? ""),
  ].filter(Boolean);

  return (
    <div className="flex-1">
      <div className="bg-lavender50 px-9 py-14 text-sm lg:px-24">
        Created {!!creatorsName && "by " + creatorsName} with{" "}
        <Link href="/aila" className="bv-3 text-hyperlink underline">
          Aila, Oak’s AI lesson assistant
        </Link>
        {". "}
        Please check content carefully before use.
      </div>
      <div className="flex items-start justify-between bg-lavender30 px-9 py-9 lg:px-24">
        <Logo />
      </div>
      <div className="flex items-center bg-lavender30 px-9 py-14 md:px-14 md:py-18">
        <div className="absolute hidden h-38 w-38 items-center justify-center rounded-lg bg-lavender50 xl:left-24 xl:flex">
          <Icon
            className="flex items-center justify-center"
            icon="ai-lesson"
            size="3xl"
            color="black"
          />
        </div>
        <div className="mx-auto flex h-24 w-full max-w-2xl flex-col items-start justify-center lg:h-32 xl:h-38 ">
          <h2 className="mb-6 text-base font-medium">
            {keyStageSubjectTuple.join(" • ")}
          </h2>
          <h1 className="text-3xl font-bold">{lessonPlan.title}</h1>
        </div>
      </div>
      <div className="mx-auto max-w-2xl px-9 py-14 pb-30 sm:px-0">
        {moderation && <GuidanceRequired moderation={moderation} />}
        <div className=" mb-14  border-b pb-14">
          <LessonPlanMapToMarkDown lessonPlan={lessonPlan} />
        </div>
      </div>
    </div>
  );
}
