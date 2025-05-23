import {
  OakBox,
  OakFlex,
  OakHeading,
  OakMaxWidth,
  OakP,
} from "@oaknational/oak-components";

import { DemoBanner } from "@/components/AppComponents/Chat/demo-banner";
import { useClerkDemoMetadata } from "@/hooks/useClerkDemoMetadata";
import { toSentenceCase } from "@/utils/toSentenceCase";

import { useDemoUser } from "./ContextProviders/Demo";
import HeaderManager from "./HeaderManager";

type LayoutProps = {
  children: React.ReactNode;
  title: string;
  subTitle: React.ReactNode;
  step: number;
  docTypeName: string | null;
};
const ResourcesLayout = ({
  children,
  title,
  subTitle,
  step,
  docTypeName,
}: Readonly<LayoutProps>) => {
  const { isDemoUser, demo } = useDemoUser();

  // Check whether clerk metadata has loaded to prevent the banner from flashing
  const clerkMetadata = useClerkDemoMetadata();
  return (
    <>
      {clerkMetadata.isSet && isDemoUser && (
        <DemoBanner
          resourceType="additionalMaterials"
          monthlyLimit={demo.appSessionsPerMonth}
          remaining={demo.additionalMaterialsSessionsRemaining}
          contactHref={demo.contactHref}
        />
      )}

      <OakBox
        as={"header"}
        $position={"fixed"}
        $zIndex={"banner"}
        $width={"100%"}
      >
        <HeaderManager />
      </OakBox>

      <OakBox
        as="main"
        $inset="all-spacing-0"
        $position={"fixed"}
        $mt="space-between-xxl"
        $pt="inner-padding-xl7"
        $background={"lavender30"}
      >
        <OakMaxWidth
          $background="white"
          $borderRadius="border-radius-m"
          $position={"fixed"}
          $bottom={"all-spacing-0"}
          $top="all-spacing-17"
          $left="all-spacing-4"
          $right="all-spacing-4"
          $width="unset"
          $overflowY={"scroll"}
          $mb="space-between-xxxl"
          $pb="inner-padding-xl"
          $maxWidth={"all-spacing-23"}
        >
          <OakBox $pa="inner-padding-xl4">
            <OakFlex
              $bb="border-solid-s"
              $borderColor="grey40"
              $pb="inner-padding-l"
              $mb="space-between-m"
              $flexDirection="column"
              $gap="all-spacing-4"
            >
              <OakBox
                $background="lemon50"
                $ph="inner-padding-m"
                $pv="inner-padding-xs"
                $borderRadius="border-radius-circle"
                $width="fit-content"
              >
                <OakP $font="body-2">
                  Step {step} of 3{" "}
                  {docTypeName && `- ${toSentenceCase(docTypeName)}`}
                </OakP>
              </OakBox>
              <OakHeading as="h1" tag="h1" $font="heading-5">
                {title}
              </OakHeading>
              <OakP $font="body-2" $color="grey70">
                {subTitle}
              </OakP>
            </OakFlex>
            {children}
          </OakBox>
        </OakMaxWidth>
      </OakBox>
    </>
  );
};

export default ResourcesLayout;
