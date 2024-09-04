"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import {
  OakBox,
  OakFlex,
  OakHeading,
  OakLink,
  OakP,
  OakColorToken,
  oakColorTokens,
  OakPrimaryButton,
} from "@oaknational/oak-components";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";

import oakSupporting from "@/assets/svg/illustration/oak_supporting.svg";
import { BetaTagPage } from "@/components/AppComponents/Chat/beta-tag";
import HeroContainer from "@/components/HeroContainer";
import { HomePageCTA } from "@/components/Home/HomePageCTA";
import Layout from "@/components/Layout";
import {
  OakBoxCustomMaxWidth,
  OakFlexCustomMaxWidth,
} from "@/components/OakBoxCustomMaxWidth";
import AiIcon from "@/components/SVGParts/AiIcon";
import LessonIcon from "@/components/SVGParts/LessonIcon";
import QuizIcon from "@/components/SVGParts/QuizIcon";
import SlidesIcon from "@/components/SVGParts/SlidesIcon";
import useAnalytics from "@/lib/analytics/useAnalytics";

export const metadata: Metadata = {
  title: "Oak ai experiments",
};

export default function HomePage({ featureFlag }) {
  const user = useUser();
  const auth = useAuth();

  const { userId } = auth;
  const { track } = useAnalytics();

  return (
    <Layout featureFlag={featureFlag}>
      <HeroContainer>
        <OakFlex
          $flexDirection={"row"}
          $justifyContent={"space-between"}
          $alignItems={["center", "flex-end"]}
        >
          <OakFlexCustomMaxWidth
            $flexDirection={"column"}
            $gap={"all-spacing-5"}
            customMaxWidth={550}
          >
            <OakBox $width="fit-content">
              <BetaTagPage />
            </OakBox>
            <OakHeading tag="h1" $font={"heading-2"}>
              Introducing Aila
            </OakHeading>
            <OakHeading tag="h2" $font={"heading-5"}>
              Build a tailor-made lesson plan and resources in minutes
            </OakHeading>
            <OakP $textAlign="left" $font="body-1">
              Transform your lesson prep with our free AI-powered lesson
              assistant. Whether it&apos;s creating bespoke resources or
              tailoring content to your class, Aila can help speed things along.
            </OakP>
            <HomePageCTA featureFlag={featureFlag} />
          </OakFlexCustomMaxWidth>

          <OakBoxCustomMaxWidth
            $display={["none", "flex"]}
            $borderColor="black"
            $borderStyle={"solid"}
            $ba={"border-solid-xl"}
            customMaxWidth={600}
            $height="fit-content"
          >
            <Image
              src={"/images/aila-home-page-still.jpg"}
              alt="Image of a computer screen offering to help with a teachers to do list"
              width={700}
              height={400}
              priority
              objectFit="cover"
            />
          </OakBoxCustomMaxWidth>
        </OakFlex>
      </HeroContainer>

      <OakFlex
        $flexDirection={["column", "row"]}
        $justifyContent={"space-between"}
        $gap={"all-spacing-14"}
        $pv={["inner-padding-xl8"]}
      >
        <OakFlexWithWidth35 $flexDirection={["column"]} $gap={"all-spacing-5"}>
          <OakHeading $font="heading-5" tag="h3">
            What can I expect?
          </OakHeading>
          <OakP $textAlign="left" $font="body-1">
            Aila can help you create a range of lesson resources. When
            you&apos;re ready, you can download everything in several editable
            formats to adapt as you like.
          </OakP>
          <OakFlex $flexDirection="column">
            <OakBox
              $borderColor="blackSemiTransparent"
              $bt={"border-solid-s"}
              $bb={"border-solid-s"}
              $pv="inner-padding-l"
            >
              <OakFlex
                $flexDirection="row"
                $gap="all-spacing-4"
                $alignItems="center"
              >
                <AiIcon /> <OakP $font="body-1-bold">1 lesson plan</OakP>
              </OakFlex>
            </OakBox>
            <OakBox
              $borderColor="blackSemiTransparent"
              $bb={"border-solid-s"}
              $pv="inner-padding-l"
            >
              <OakFlex
                $flexDirection="row"
                $gap="all-spacing-4"
                $alignItems="center"
              >
                <SlidesIcon /> <OakP $font="body-1-bold">1 slide deck</OakP>
              </OakFlex>
            </OakBox>
            <OakBox
              $borderColor="blackSemiTransparent"
              $bb={"border-solid-s"}
              $pv="inner-padding-l"
            >
              <OakFlex
                $flexDirection="row"
                $gap="all-spacing-4"
                $alignItems="center"
              >
                <QuizIcon /> <OakP $font="body-1-bold">2 quizzes</OakP>
              </OakFlex>
            </OakBox>
            <OakBox
              $borderColor="blackSemiTransparent"
              $bb={"border-solid-s"}
              $pv="inner-padding-l"
            >
              <OakFlex
                $flexDirection="row"
                $gap="all-spacing-4"
                $alignItems="center"
              >
                <LessonIcon /> <OakP $font="body-1-bold">1 worksheet</OakP>
              </OakFlex>
            </OakBox>
          </OakFlex>
        </OakFlexWithWidth35>
        <OakFlexWithWidth65 $flexDirection="column" $gap="all-spacing-10">
          <OakFlex $flexDirection={"column"} $gap={"all-spacing-5"}>
            <OakHeading $font="heading-5" tag="h3">
              How do I create a lesson with Aila?
            </OakHeading>
            <OakFlex $flexDirection={"column"} $gap={"all-spacing-7"}>
              <OakP $textAlign="left" $font="body-1">
                Tell Aila what you want to teach and it will guide you through
                creating a lesson, starting with your learning outcome. At each
                stage, you can add Aila&apos;s suggestions into your lesson or
                ask for changes, such as adding or removing content, lowering
                the reading age or even changing contexts to suit your
                school&apos;s location. Try asking for different tasks or
                activities to suit your pupils, and download the editable lesson
                resources.
              </OakP>

              {!userId || !featureFlag ? (
                <BoldOakLink variant="text-link" href="#">
                  Coming soon...
                </BoldOakLink>
              ) : (
                <BoldOakLink
                  href="/aila"
                  element={Link}
                  onClick={() => {
                    track.lessonAssistantAccessed({
                      product: "ai lesson assistant",
                      isLoggedIn: !!user.isSignedIn,
                      componentType:
                        "homepage_secondary_create_a_lesson_button",
                    });
                  }}
                >
                  Create a lesson
                </BoldOakLink>
              )}
            </OakFlex>
          </OakFlex>
          <OakFlex $flexDirection={"column"} $gap={"all-spacing-5"}>
            <OakHeading $font="heading-5" tag="h3">
              What&apos;s different about Aila?
            </OakHeading>
            <OakP $textAlign="left" $font="body-1">
              Unlike other AI tools, Aila draws on our extensive library of
              content, painstakingly designed and tested by teachers and subject
              experts, and aligned with the national curriculum. When you ask
              Aila for resources, you&apos;re much more likely to get
              high-quality results that are geared to UK pupils, schools and
              classrooms.
            </OakP>
            {featureFlag && (
              <BoldOakLink element={Link} href="/faqs">
                Find out more about Aila
              </BoldOakLink>
            )}
          </OakFlex>
          <OakFlex $flexDirection={"column"} $gap={"all-spacing-5"}>
            <OakHeading $font="heading-5" tag="h3">
              Help us make Aila better
            </OakHeading>
            <OakP $textAlign="left" $font="body-1">
              Aila is still in development, and we&apos;re the first to admit
              it&apos;s not perfect. There may be some glitches and it
              doesn&apos;t yet have all the features you&apos;ll want. Aila
              can&apos;t give you images for your slides or model diagrams,
              though it can suggest where to find them. And like all AI tools,
              sometimes it&apos;s less able in certain subjects and makes
              mistakes. We&apos;re working hard to make it as good as it can be,
              and that&apos;s where your feedback and suggestions come in to
              help us get there.
            </OakP>
          </OakFlex>
        </OakFlexWithWidth65>
      </OakFlex>
      <OakFlexWithBackground
        $flexDirection={["column-reverse", "row"]}
        $justifyContent={["center", "space-between"]}
        $alignContent={"center"}
        $gap="all-spacing-10"
        $pv={["inner-padding-xl8"]}
        $background={"lavender30"}
        fullWidthBgColor={"lavender30"}
      >
        <OakFlex $flexDirection="column" $gap="all-spacing-6">
          <OakHeading $font="heading-3" tag="h3">
            Quiz designer
          </OakHeading>

          <OakP>
            Create quizzes for your pupils in a flash. Use our quiz designer to
            generate answers, both right and wrong. Share the quizzes with
            others or export them in a range of formats ready for the classroom.
          </OakP>

          <OakPrimaryButton
            element={Link}
            href="/quiz-designer"
            iconName="arrow-right"
            isTrailingIcon={true}
          >
            Get started
          </OakPrimaryButton>
        </OakFlex>

        <Image src={oakSupporting} alt="jigsaw image" />
      </OakFlexWithBackground>

      <OakFlexWithBackground
        $flexDirection={"column"}
        $justifyContent="space-between"
        $alignContent={"center"}
        $gap="all-spacing-6"
        $pv={["inner-padding-xl8"]}
        $background={"lavender50"}
        fullWidthBgColor={"lavender50"}
      >
        <OakHeading $font="heading-3" tag="h3">
          How our AI works
        </OakHeading>

        <OakP>
          Oak AI Experiments explores ways that large language models (LLMs) can
          generate effective teaching resources and reduce workloads. We do this
          by using a combination of carefully chosen prompts – instructions
          aimed at getting useful responses – and our existing high-quality
          content. Aila currently has a 9000-word prompt to ensure we get
          appropriate results with as few errors and &apos;hallucinations&apos;
          as possible.
        </OakP>
      </OakFlexWithBackground>
    </Layout>
  );
}

const OakFlexWithBackground = styled(OakFlex)<{
  fullWidthBgColor: OakColorToken;
}>`
  position: relative;
  &::before {
    content: "";
    position: absolute;
    left: -50vw;
    top: 0;
    z-index: -1;
    height: 100%;
    width: 150vw;
    background-color: ${(props) => oakColorTokens[props.fullWidthBgColor]};
  }
  img {
    max-width: 300px;
  }
  p {
    max-width: 700px;
  }
`;

const BoldOakLink = styled(OakLink)`
  font-size: 18px;
  font-weight: bold;
  color: #0d24c4;
`;

const OakFlexWithWidth65 = styled(OakFlex)`
  width: 65%;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const OakFlexWithWidth35 = styled(OakFlex)`
  width: 35%;
  @media (max-width: 768px) {
    width: 100%;
  }
`;
