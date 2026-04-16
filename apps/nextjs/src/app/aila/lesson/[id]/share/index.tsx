"use client";

import { useEffect, useState } from "react";

import type { PartialLessonPlan } from "@oakai/aila/src/protocol/schema";
import { parseKeyStage } from "@oakai/core/src/data/parseKeyStage";
import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import { getDisplayCategories } from "@oakai/core/src/utils/ailaModeration/severityLevel";

import { OakSmallPrimaryButton } from "@oaknational/oak-components";
import * as Sentry from "@sentry/react";
import Link from "next/link";

import { ContentGuidanceBanner } from "@/components/AppComponents/Moderation/ContentGuidanceBanner";
import StaticLessonPlanRenderer from "@/components/AppComponents/static-lesson-plan-renderer";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { OakMathJaxContext } from "@/components/MathJax";
import { slugToSentenceCase } from "@/utils/toSentenceCase";

interface ShareChatProps {
  lessonPlan: PartialLessonPlan;
  creatorsName: string | null;
  moderation: PersistedModerationBase | null | undefined;
}
export default function ShareChat({
  lessonPlan,
  creatorsName,
  moderation,
}: Readonly<ShareChatProps>) {
  const [userHasCopiedLink, setUserHasCopiedLink] = useState(false);

  useEffect(() => {
    if (userHasCopiedLink) {
      const timeout = setTimeout(() => {
        setUserHasCopiedLink(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [userHasCopiedLink, setUserHasCopiedLink]);

  const keyStageSubjectTuple = [
    slugToSentenceCase(parseKeyStage(lessonPlan.keyStage ?? "")),
    slugToSentenceCase(lessonPlan.subject ?? ""),
  ].filter(Boolean);

  return (
    <div className="flex-1">
      <div data-testid="share-banner" className="bg-lavender50 px-9">
        <div className="mx-auto max-w-2xl py-14 text-sm min-[835px]:max-w-[80rem] min-[835px]:px-27">
          Created {!!creatorsName && "by " + creatorsName} with{" "}
          <Link href="/" className="bv-3 text-hyperlink underline">
            Aila, Oak&apos;s AI lesson assistant
          </Link>
          {". "}
          Please check content carefully before use.
        </div>
      </div>
      <div className="bg-lavender30 px-9">
        <div className="mx-auto max-w-2xl min-[835px]:max-w-[80rem] min-[835px]:px-27">
          <div className="py-9">
            <Logo />
          </div>
          <div className="relative pb-24 pt-18">
            <div className="absolute left-1 top-14 hidden items-center justify-center py-14 xl:flex">
              <Icon
                className="flex items-center justify-center"
                icon="ai-lesson"
                size="3xl"
                color="black"
              />
            </div>
            <div className="mx-auto flex max-w-2xl flex-col items-start gap-14">
              <h2
                data-testid="key-stage-subject"
                className="text-base font-medium"
              >
                {keyStageSubjectTuple.join(" • ")}
              </h2>
              <h1 className="text-3xl font-bold">{lessonPlan.title}</h1>
              <OakSmallPrimaryButton
                data-testid="copy-link"
                onClick={() => {
                  void navigator.clipboard
                    .writeText(window.location.href)
                    .then(() => {
                      setUserHasCopiedLink(true);
                    })
                    .catch((e) => {
                      Sentry.captureException(e);
                    });
                }}
              >
                {userHasCopiedLink ? " Link copied" : "Copy link"}
              </OakSmallPrimaryButton>
            </div>
          </div>
        </div>
      </div>
      <div className="px-9 py-14 pb-30">
        <div className="mx-auto max-w-2xl">
          {moderation && (
            <ContentGuidanceBanner
              categories={getDisplayCategories(moderation)}
            />
          )}
          <div
            data-testid="lesson-plan-markdown"
            className="mb-14 border-b pb-14"
          >
            <OakMathJaxContext>
              <StaticLessonPlanRenderer lessonPlan={lessonPlan} />
            </OakMathJaxContext>
          </div>
        </div>
      </div>
    </div>
  );
}
