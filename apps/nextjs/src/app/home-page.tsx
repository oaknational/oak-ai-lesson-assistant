"use client";

import { useUser } from "@clerk/nextjs";
import MuxPlayer from "@mux/mux-player-react";
import type { OakColorToken } from "@oaknational/oak-components";
import {
  OakBox,
  OakFlex,
  OakHeading,
  OakLink,
  OakP,
  OakQuote,
  oakColorTokens,
} from "@oaknational/oak-components";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";

import oakSupporting from "@/assets/svg/illustration/oak_supporting.svg";
import type { HomePageQueryResult } from "@/cms/types/aiHomePageType";
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

const StyledMuxPlayer = styled(MuxPlayer)`
  width: 600px;
  height: 334px;
  @media (max-width: 1100px) {
    width: 100%;
    height: fit-content;
  }
`;

const OakFlexCustomMaxWidthWithHalfWidth = styled(OakFlexCustomMaxWidth)`
  @media (max-width: 1200px) {
    width: 50%;
  }
  @media (max-width: 768px) {
    width: 100%;
  }
`;

export type HomePageProps = Readonly<{
  pageData: HomePageQueryResult | null;
}>;

export default function HomePage(props: HomePageProps) {
  return (
    <Layout>
      <HomePageContent {...props} />
    </Layout>
  );
}

export function HomePageContent({ pageData }: HomePageProps) {
  const user = useUser();

  const { track } = useAnalytics();

  return (
    <>
      <HeroContainer>
        <OakFlex
          $flexDirection={["column", "row"]}
          $justifyContent={"space-between"}
          $alignItems={["center"]}
          $gap={"all-spacing-5"}
        >
          <OakFlexCustomMaxWidthWithHalfWidth
            $flexDirection={"column"}
            $gap={"all-spacing-5"}
            customMaxWidth={550}
            $width={"100%"}
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

            <OakBoxCustomMaxWidth
              $display={["flex", "none"]}
              $borderColor="black"
              $borderStyle={"solid"}
              $ba={"border-solid-xl"}
              customMaxWidth={600}
              $height="fit-content"
            >
              <StyledMuxPlayer
                playbackId={pageData?.heroVideo.video.asset.playbackId}
              />
            </OakBoxCustomMaxWidth>

            <OakP $textAlign="left" $font="body-1">
              Transform your lesson prep with our free AI-powered lesson
              assistant. Whether it&apos;s creating bespoke resources or
              tailoring content to your class, Aila can help speed things along.
            </OakP>
            <HomePageCTA />
          </OakFlexCustomMaxWidthWithHalfWidth>

          <OakFlexCustomMaxWidthWithHalfWidth
            $display={["none", "flex"]}
            $borderColor="black"
            $borderStyle={"solid"}
            $ba={"border-solid-xl"}
            customMaxWidth={600}
            $height="fit-content"
            $width="100%"
          >
            <StyledMuxPlayer
              playbackId={pageData?.heroVideo.video.asset.playbackId}
            />
          </OakFlexCustomMaxWidthWithHalfWidth>
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
              <OakBoxCustomMaxWidth
                $display={["flex"]}
                $borderColor="black"
                $borderStyle={"solid"}
                $ba={"border-solid-xl"}
                customMaxWidth={600}
                $height="fit-content"
              >
                <StyledMuxPlayer
                  playbackId={
                    pageData?.belowTheFoldVideo.video.asset.playbackId
                  }
                  thumbnailTime={3.67}
                />
              </OakBoxCustomMaxWidth>
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
              <BoldOakLink
                href="/aila"
                element={Link}
                onClick={() => {
                  track.lessonAssistantAccessed({
                    product: "ai lesson assistant",
                    isLoggedIn: !!user.isSignedIn,
                    componentType: "homepage_secondary_create_a_lesson_button",
                  });
                }}
              >
                Create a lesson
              </BoldOakLink>
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

            <BoldOakLink element={Link} href="/faqs">
              Find out more about Aila
            </BoldOakLink>
          </OakFlex>

          <OakQuote
            quote="Using AI to support my planning and teaching wasn’t something I’d really considered until I came across Aila. To say I was blown away would be an understatement!"
            authorName="Avril"
            authorTitle="Deputy Headteacher at Bedford Drive Primary School"
          />
          <OakQuote
            quote="Incorporating Aila into my teaching toolkit has the potential to not only save me time - around 30 minutes per lesson - but also enhance the quality and effectiveness of my lessons, ultimately benefiting both myself and my students."
            color="bg-decorative4-main"
            authorName="James"
            authorTitle="Teacher at St Cuthbert Mayne School"
          />

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
            Our AI quiz designer tool has been discontinued for the time being
            as we focus on developing Aila, our AI-powered lesson assistant.
            Your feedback will help shape how tools like this might be used in
            the future – share your thoughts{" "}
            <Link
              href="mailto:help@thenational.academy?subject=AI quiz designer feedback"
              target="_blank"
              rel="noopener noreferrer"
            >
              <OakLink>here</OakLink>
            </Link>
            .
          </OakP>
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
          Oak AI experiments explores ways that large language models (LLMs) can
          generate effective teaching resources and reduce workloads. We do this
          by using a combination of carefully chosen prompts – instructions
          aimed at getting useful responses – and our existing high-quality
          content. Aila currently has a 9000-word prompt to ensure we get
          appropriate results with as few errors and &apos;hallucinations&apos;
          as possible.
        </OakP>
      </OakFlexWithBackground>
    </>
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
