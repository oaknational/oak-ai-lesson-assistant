"use client";

import { useUser } from "@clerk/nextjs";
import MuxPlayer from "@mux/mux-player-react";
import type { OakColorToken } from "@oaknational/oak-components";
import {
  OakBox,
  OakFlex,
  OakGrid,
  OakGridArea,
  OakHeading,
  OakLink,
  OakP,
  OakQuote,
  OakTertiaryButton,
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
import useAnalytics from "@/lib/analytics/useAnalytics";
import { getAilaUrl } from "@/utils/getAilaUrl";

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
      <HomePageHero pageData={pageData} />
      <OakGrid>
        <OakGridArea
          $position={["static", "static", "sticky"]}
          $colSpan={[0, 0, 5]}
          $height="fit-content"
          $top={["all-spacing-0", "all-spacing-0", "space-between-l"]}
          $alignSelf={"start"}
          $pv={["inner-padding-xl6"]}
          $display={["none", "none", "flex"]}
        >
          <HomePageNav />
        </OakGridArea>
        <OakGridArea
          $gap={"all-spacing-14"}
          $pv={["inner-padding-xl6"]}
          $colSpan={[12, 0, 7]}
        >
          <HomePageAboutAila pageData={pageData} user={user} track={track} />
        </OakGridArea>
      </OakGrid>

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

function HomePageHero({ pageData }: HomePageProps) {
  return (
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
          <OakHeading tag="h1" $font={"heading-4"}>
            Build tailor-made lessons and teaching materials with AI
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
            assistant. Whether it&apos;s creating bespoke resources or tailoring
            content to your class, Aila can help speed things along.
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
  );
}

type HomePageAboutAilaProps = {
  pageData: HomePageQueryResult | null;
  user: ReturnType<typeof useUser>;
  track: ReturnType<typeof useAnalytics>["track"];
};

function HomePageAboutAila({ pageData, user, track }: HomePageAboutAilaProps) {
  return (
    <OakBox>
      <OakFlex $flexDirection={"column"} $gap={"all-spacing-6"}>
        <OakHeading id="what-to-expect" $font="heading-5" tag="h3">
          What to expect from Aila
        </OakHeading>
        <OakP $font={"body-2"}>
          Aila can help you create high-quality lessons in minutes. When
          you&apos;re ready, you can download everything in several editable
          formats to adapt as you like.
        </OakP>
        <OakLink href={getAilaUrl("start")}> Start creating with Aila</OakLink>
        <OakHeading
          id="creating-a-lesson"
          $mt={"space-between-m2"}
          $font="heading-5"
          tag="h3"
        >
          Creating a lesson
        </OakHeading>
        <OakFlex $flexDirection={"column"} $gap={"all-spacing-6"}>
          <OakBoxCustomMaxWidth
            $display={["flex"]}
            $borderColor="black"
            $borderStyle={"solid"}
            $ba={"border-solid-xl"}
            customMaxWidth={600}
            $height="fit-content"
          >
            <StyledMuxPlayer
              playbackId={pageData?.belowTheFoldVideo.video.asset.playbackId}
              thumbnailTime={3.67}
            />
          </OakBoxCustomMaxWidth>
          <OakP $textAlign="left" $font="body-1">
            Tell Aila what you want to teach and it will guide you through
            creating a lesson, starting with your learning outcome. At each
            stage, you can add Aila&apos;s suggestions into your lesson or ask
            for changes, such as adding or removing content, lowering the
            reading age or even changing contexts to suit your school&apos;s
            location. Try asking for different tasks or activities to suit your
            pupils, and download the editable lesson resources.
          </OakP>
          <OakLink
            href={getAilaUrl("lesson")}
            element={Link}
            onClick={() => {
              track.lessonAssistantAccessed({
                product: "ai lesson assistant",
                isLoggedIn: !!user.isSignedIn,
                componentType: "homepage_secondary_create_a_lesson_button",
              });
            }}
          >
            Create a lesson with Aila
          </OakLink>
        </OakFlex>
        <OakFlex
          $mb={"space-between-m"}
          $flexDirection={"column"}
          $gap={"all-spacing-6"}
        >
          <OakHeading
            id="creating-teaching-materials"
            $mt={"space-between-m2"}
            $font="heading-5"
            tag="h3"
          >
            Creating teaching materials
          </OakHeading>
          <OakP $textAlign="left" $font="body-1">
            Already planned your lesson? You can ask Aila to create glossaries,
            comprehension tasks and quizzes in minutes to enhance an existing
            Oak lesson or your own lesson. Simply tell Aila what you want to
            teach, choose your teaching material and create a tailored resource
            in minutes. Download your resource, or try asking Aila to modify it
            to better suit your pupils&apos; needs.
          </OakP>
          <OakLink href={getAilaUrl("teaching-materials")}>
            Create teaching materials with Aila
          </OakLink>
        </OakFlex>
        <OakFlex
          $mb={"space-between-m"}
          $flexDirection={"column"}
          $gap={"all-spacing-5"}
        >
          <OakHeading
            id="whats-different-about-aila"
            $font="heading-5"
            tag="h3"
          >
            What&apos;s different about Aila?
          </OakHeading>
          <OakP $textAlign="left" $font="body-1">
            Unlike other AI tools, Aila draws on our extensive library of
            content, painstakingly designed and tested by teachers and subject
            experts, and aligned with the national curriculum. When you ask Aila
            for resources, you&apos;re much more likely to get high-quality
            results that are geared to UK pupils, schools and classrooms.
          </OakP>

          <OakLink element={Link} href="/faqs">
            Find out more about Aila
          </OakLink>
        </OakFlex>
        <OakFlex
          $mb={"space-between-m"}
          $flexDirection={"column"}
          $gap={"all-spacing-9"}
        >
          <OakQuote
            quote="Using AI to support my planning and teaching wasn't something I'd really considered until I came across Aila. To say I was blown away would be an understatement!"
            authorName="Avril"
            authorTitle="Deputy Headteacher at Bedford Drive Primary School"
          />
          <OakQuote
            quote="Incorporating Aila into my teaching toolkit has the potential to not only save me time - around 30 minutes per lesson - but also enhance the quality and effectiveness of my lessons, ultimately benefiting both myself and my students."
            color="bg-decorative4-main"
            authorName="James"
            authorTitle="Teacher at St Cuthbert Mayne School"
          />
        </OakFlex>
        <OakFlex
          $mb={"space-between-m"}
          $flexDirection={"column"}
          $gap={"all-spacing-5"}
        >
          <OakHeading id="how-oaks-ai-works" $font="heading-5" tag="h3">
            How Oak&apos;s AI works
          </OakHeading>
          <OakP $textAlign="left" $font="body-1">
            Oak AI Experiments explores ways that large language models (LLMs)
            can generate effective teaching resources and reduce workloads. We
            do this by using a combination of carefully chosen prompts –
            instructions aimed at getting useful responses – and our existing
            high-quality content. Aila currently has a 9000-word prompt to
            ensure we get appropriate results with as few errors and
            &apos;hallucinations&apos; as possible.
          </OakP>
          <OakLink href="https://docs.google.com/forms/d/e/1FAIpQLSf2AWtTtr4JISeMV4BY5LCMYhDFPz0RPNdXzmy_vjk4BmM69Q/viewform">
            Give feedback here
          </OakLink>
        </OakFlex>

        <OakFlex
          $mb={"space-between-m"}
          $flexDirection={"column"}
          $gap={"all-spacing-5"}
        >
          <OakHeading id="give-feedback" $font="heading-5" tag="h3">
            Give feedback
          </OakHeading>
          <OakP $textAlign="left" $font="body-1">
            Aila is still in development, and we&apos;re the first to admit
            it&apos;s not perfect. There may be some glitches and it
            doesn&apos;t yet have all the features you&apos;ll want. Aila
            can&apos;t give you images for your slides or model diagrams, though
            it can suggest where to find them. And like all AI tools, sometimes
            it&apos;s less able in certain subjects and makes mistakes.
            We&apos;re working hard to make it as good as it can be, and that's
            where your feedback and suggestions come in to help us get there.
          </OakP>
          <OakLink href="https://docs.google.com/forms/d/e/1FAIpQLSf2AWtTtr4JISeMV4BY5LCMYhDFPz0RPNdXzmy_vjk4BmM69Q/viewform">
            Give feedback here
          </OakLink>
        </OakFlex>
      </OakFlex>
    </OakBox>
  );
}

const HomePageNav = () => {
  return (
    <OakFlex $display="flex" $flexDirection="column" $gap="space-between-m">
      <OakTertiaryButton
        iconName="chevron-right"
        element="a"
        href="#what-to-expect"
      >
        What to expect
      </OakTertiaryButton>
      <OakTertiaryButton
        iconName="chevron-right"
        element="a"
        href="#creating-a-lesson"
      >
        Creating a lesson
      </OakTertiaryButton>
      <OakTertiaryButton
        iconName="chevron-right"
        element="a"
        href="#creating-teaching-materials"
      >
        Creating teaching materials
      </OakTertiaryButton>
      <OakTertiaryButton
        iconName="chevron-right"
        element="a"
        href="#whats-different-about-aila"
      >
        What&apos;s different about Aila
      </OakTertiaryButton>
      <OakTertiaryButton
        iconName="chevron-right"
        element="a"
        href="#how-oaks-ai-works"
      >
        How Oak&apos;s AI works
      </OakTertiaryButton>
      <OakTertiaryButton
        iconName="chevron-right"
        element="a"
        href="#give-feedback"
      >
        Give feedback
      </OakTertiaryButton>
    </OakFlex>
  );
};
