import { useEffect, useState } from "react";

import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";

import { OakSmallPrimaryButton } from "@oaknational/oak-components";

import LoadingWheel from "@/components/LoadingWheel";
import { useLessonPlanStore } from "@/stores/AilaStoresProvider";
import { trpc } from "@/utils/trpc";

const handleTranslate = async ({
  lang,
  mutateAsync,
  setTranslatedLessonPlan,
  lessonPlan,
}: {
  lang: string;
  mutateAsync: ({
    lessonPlan,
    language,
  }: {
    lessonPlan: LooseLessonPlan;
    language: string;
  }) => Promise<LooseLessonPlan>;
  setTranslatedLessonPlan: React.Dispatch<
    React.SetStateAction<LooseLessonPlan | null>
  >;
  lessonPlan: LooseLessonPlan;
}) => {
  if (!lang) return;

  try {
    const result = await mutateAsync({
      lessonPlan: lessonPlan,
      language: lang,
    });

    if (typeof setTranslatedLessonPlan === "function") {
      setTranslatedLessonPlan(result);
    } else {
      console.error("setTranslatedLessonPlan is not a function");
    }
  } catch (error) {
    console.error("Translation error:", error);
  }
};

const TranslateWindow = ({ closeDialog }: { closeDialog: () => void }) => {
  const [language, setLanguage] = useState("");
  const translate = trpc.translate.translateObjectTo.useMutation();
  const [translatedLessonPlan, setTranslatedLessonPlan] =
    useState<LooseLessonPlan | null>(null);
  const isTranslating = translate.isLoading;
  const lessonPlan = useLessonPlanStore((state) => state.lessonPlan);
  const lessonId = useLessonPlanStore((state) => state.id);

  useEffect(() => {
    if (translatedLessonPlan) {
      localStorage.setItem(
        `${lessonId}-translatedLessonPlan`,
        JSON.stringify(translatedLessonPlan),
      );
      closeDialog();
    }
  }, [translatedLessonPlan, closeDialog, lessonId]);

  return (
    <div className="flex flex-col items-center justify-center gap-14">
      {isTranslating ? (
        <div className="flex items-center justify-center">
          <LoadingWheel />
          <p>Translating to {language}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-14">
          <label className="flex flex-col gap-7">
            <span>Enter the language you would like to translate too</span>
            <input
              className="rounded-sm border border-black p-7"
              type="text"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="e.g. French"
            />
          </label>
          <OakSmallPrimaryButton
            onClick={() =>
              handleTranslate({
                lang: language,
                setTranslatedLessonPlan,
                lessonPlan,
                mutateAsync: translate.mutateAsync,
              })
            }
          >
            Translate
          </OakSmallPrimaryButton>
          <p className="mx-auto max-w-[500px] text-center text-sm">
            This will translate only the generated text so far. If you make
            changes or add to your lesson you will need to run this again.
          </p>
        </div>
      )}
    </div>
  );
};

export default TranslateWindow;
