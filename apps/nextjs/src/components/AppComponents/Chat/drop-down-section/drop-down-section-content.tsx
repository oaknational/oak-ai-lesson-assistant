import type {
  LessonPlanKey,
  LessonPlanSectionWhileStreaming,
} from "@oakai/aila/src/protocol/schema";

import { OakFlex } from "@oaknational/oak-components";

import { SectionContent } from "../../SectionContent";
import AddAdditionalMaterialsButton from "./add-additional-materials-button";
import FlagButton from "./flag-button";
import ModifyButton from "./modify-button";
import { sectionTitle } from "./sectionTitle";

export type DropDownSectionContentProps = Readonly<{
  sectionKey: LessonPlanKey;
  value: LessonPlanSectionWhileStreaming;
}>;

export const DropDownSectionContent = ({
  sectionKey,
  value,
}: DropDownSectionContentProps) => {
  return (
    <OakFlex $flexDirection="column">
      <SectionContent sectionKey={sectionKey} value={value} />

      <OakFlex
        $gap="all-spacing-3"
        $mt="space-between-s"
        $position="relative"
        $display={["none", "flex"]}
      >
        {sectionKey === "additionalMaterials" && value === "None" ? (
          <AddAdditionalMaterialsButton
            sectionTitle={sectionTitle(sectionKey)}
            sectionPath={sectionKey}
            sectionValue={value}
          />
        ) : (
          <ModifyButton
            sectionTitle={sectionTitle(sectionKey)}
            sectionPath={sectionKey}
            sectionValue={value}
          />
        )}

        <FlagButton
          sectionTitle={sectionTitle(sectionKey)}
          sectionPath={sectionKey}
          sectionValue={value}
        />
      </OakFlex>
    </OakFlex>
  );
};
