import {
  isSafe,
  moderationSlugToDescription,
} from "@oakai/core/src/utils/ailaModeration/helpers";
import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

type GuidanceRequiredProps = Readonly<{
  moderation: PersistedModerationBase;
  className?: string;
}>;
export function GuidanceRequired({
  moderation,
  className,
}: GuidanceRequiredProps) {
  if (isSafe(moderation)) {
    return null;
  }
  const { categories } = moderation;

  return (
    <div className={cn("flex rounded-md bg-videoBlue p-14", className)}>
      <div className="ml-4 mr-12">
        <Icon icon="warning" />
      </div>
      <div>
        <h2 className="text-base font-bold">Guidance required</h2>
        <p className="text-sm">
          Contains {categories.map(moderationSlugToDescription).join(", ")}.
          Check content carefully.
        </p>
      </div>
    </div>
  );
}
