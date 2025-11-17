import {
  OakBox,
  OakFlex,
  OakHeading,
  OakMaxWidth,
  OakP,
} from "@oaknational/oak-components";

import { Header } from "./AppComponents/Chat/header";
import { useDemoUser } from "./ContextProviders/Demo";

type LayoutProps = {
  children: React.ReactNode;
  title: string;
  subTitle: React.ReactNode;
  step: number;
  docTypeName: string | null;
};
const TeachingMaterialsLayout = ({
  children,
  title,
  subTitle,
  step,
  docTypeName,
}: Readonly<LayoutProps>) => {
  const { isDemoUser } = useDemoUser();
  return (
    <>
      <OakBox
        as={"header"}
        $position={"fixed"}
        $zIndex={"banner"}
        $width={"100%"}
      >
        <Header page={"teachingMaterials"} />
      </OakBox>
      <OakFlex
        as="main"
        $alignItems="center"
        $justifyContent="center"
        $minHeight="100vh"
        $pt="spacing-72"
        $pb="spacing-24"
        $flexDirection="column"
        $background={"lavender30"}
        $ph={["spacing-24", "spacing-48"]}
      >
        <OakMaxWidth
          $mt={[isDemoUser ? "spacing-72" : "spacing-24", "spacing-24"]}
          $position={"relative"}
          $background="white"
          $borderRadius="border-radius-m"
          $mh="spacing-24"
          $width="100%"
          $mb="spacing-56"
          $pb="spacing-24"
          $maxWidth={"spacing-960"}
        >
          <OakFlex
            $flexDirection="column"
            $ph={["spacing-24", "spacing-80"]}
            $pv={["spacing-24", "spacing-48"]}
            $width={"100%"}
          >
            <OakFlex
              $bb="border-solid-s"
              $borderColor="grey40"
              $pb="spacing-20"
              $mb="spacing-24"
              $flexDirection="column"
            >
              <OakBox
                $background="bg-decorative2-subdued"
                $ph="spacing-16"
                $pv="spacing-8"
                $borderRadius="border-radius-circle"
                $width="fit-content"
                $mb={"spacing-24"}
              >
                <OakP $font="body-2">
                  {step === 4 ? docTypeName : `Step ${step} of 4`}
                </OakP>
              </OakBox>
              <OakHeading as="h1" tag="h1" $font="heading-5">
                {title}
              </OakHeading>
              <OakP $mv="spacing-8" $font="body-2" $color="text-primary">
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

export default TeachingMaterialsLayout;
