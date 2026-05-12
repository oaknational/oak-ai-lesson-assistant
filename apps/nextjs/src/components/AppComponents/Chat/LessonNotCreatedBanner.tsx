import { OakInlineBanner, OakPrimaryButton } from "@oaknational/oak-components";
import { useRouter } from "next/navigation";

import { getAilaUrl } from "@/utils/getAilaUrl";

export function LessonNotCreatedBanner() {
  const router = useRouter();

  return (
    <div className="w-full px-14 pb-14 pt-9 sm:px-22 sm:pb-22 sm:pt-7">
      <OakInlineBanner
        isOpen
        type="neutral"
        variant="large"
        icon="info"
        title="This lesson couldn't be created."
        message="Try starting a new lesson, providing a subject, key stage, and title."
        $width="100%"
        cta={
          <OakPrimaryButton
            iconName="arrow-right"
            isTrailingIcon
            onClick={() => router.push(getAilaUrl("lesson"))}
          >
            New lesson
          </OakPrimaryButton>
        }
      />
    </div>
  );
}
