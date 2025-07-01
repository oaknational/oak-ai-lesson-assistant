import {
  OakBox,
  OakFlex,
  OakHeading,
  OakMaxWidth,
  OakP,
} from "@oaknational/oak-components";

import { DemoBanner } from "@/components/AppComponents/Chat/demo-banner";
import { useClerkDemoMetadata } from "@/hooks/useClerkDemoMetadata";

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
      <OakFlex
        as="main"
        $alignItems="center"
        $justifyContent="center"
        $minHeight="100vh"
        $pt="inner-padding-xl7"
        $pb="inner-padding-xl"
        $flexDirection="column"
        $background={"lavender30"}
        $ph={["inner-padding-xl", "inner-padding-xl4"]}
      >
        <OakMaxWidth
          $mt={["space-between-m"]}
          $position={"relative"}
          $background="white"
          $borderRadius="border-radius-m"
          $mh="space-between-m"
          $width="100%"
          $mb="space-between-xl"
          $pb="inner-padding-xl"
          $maxWidth={"all-spacing-23"}
        >
          <OakFlex
            $flexDirection="column"
            // $position={"relative"}
            // $overflowY={"auto"}
            $ph={["inner-padding-xl", "inner-padding-xl8"]}
            $pv={["inner-padding-xl", "inner-padding-xl4"]}
            $width={"100%"}
          >
            <OakFlex
              $bb="border-solid-s"
              $borderColor="grey40"
              $pb="inner-padding-l"
              $mb="space-between-m"
              $flexDirection="column"
            >
              <OakBox
                $background="bg-decorative2-subdued"
                $ph="inner-padding-m"
                $pv="inner-padding-xs"
                $borderRadius="border-radius-circle"
                $width="fit-content"
                $mb={"space-between-m"}
              >
                <OakP $font="body-2">
                  {step === 4 ? docTypeName : `Step ${step} of 4`}
                </OakP>
              </OakBox>
              <OakHeading as="h1" tag="h1" $font="heading-5">
                {title}
              </OakHeading>
              <OakP $mv="space-between-ssx" $font="body-2" $color="grey70">
                {subTitle}
              </OakP>
            </OakFlex>
            {children}
          </OakFlex>
        </OakMaxWidth>
      </OakFlex>
    </>
  );
};

export default ResourcesLayout;
