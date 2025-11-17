"use client";

import { useUser } from "@clerk/nextjs";
import MuxPlayer from "@mux/mux-player-react";
import type {
  OakAllSpacingToken,
  OakColorToken,
  OakIconName,
  OakUiRoleToken,
} from "@oaknational/oak-components";
import {
  OakBox,
  OakFlex,
  OakGrid,
  OakGridArea,
  OakHeading,
  OakIcon,
  OakLI,
  OakP,
  OakQuote,
  OakSecondaryButton,
  OakSmallPrimaryInvertedButton,
  OakTertiaryButton,
  OakUL,
  oakColorTokens,
} from "@oaknational/oak-components";
import type { Metadata } from "next";
import Image from "next/image";
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

function SubjectIcon({
  iconName,
  background,
  iconWidth = "spacing-72",
  iconHeight = "spacing-72",
  containerWidth = "spacing-100",
  containerHeight = "spacing-100",
}: {
  iconName: OakIconName;
  background: OakUiRoleToken;
  iconWidth?: OakAllSpacingToken;
  iconHeight?: OakAllSpacingToken;
  containerWidth?: OakAllSpacingToken;
  containerHeight?: OakAllSpacingToken;
}) {
  return (
    <OakFlex
      $background={background}
      $borderRadius={"border-radius-m"}
      $minWidth={containerWidth}
      $minHeight={containerHeight}
      $justifyContent={"center"}
      $alignItems={"center"}
    >
      <OakIcon $width={iconWidth} $height={iconHeight} iconName={iconName} />
    </OakFlex>
  );
}

function IconInfoCardLink({
  iconName,
  background,
  buttonLabelMobile,
  buttonLabel,
  title,
  fileExtension,
  href,
}: {
  iconName: OakIconName;
  background: OakUiRoleToken;
  title: string;
  buttonLabelMobile?: string;
  buttonLabel: string;
  fileExtension: string;
  href: string;
}) {
  return (
    <OakFlex
      $width={"100%"}
      $alignItems="center"
      $gap={["spacing-12", "spacing-24"]}
    >
      <OakBox $display={["none", "flex"]}>
        <SubjectIcon iconName={iconName} background={background} />
      </OakBox>
      <OakBox $display={["flex", "none"]}>
        <SubjectIcon
          iconHeight="spacing-56"
          iconWidth="spacing-56"
          containerWidth="spacing-72"
          containerHeight="spacing-72"
          iconName={iconName}
          background={background}
        />
      </OakBox>
      <OakFlex $flexDirection="column" $gap="spacing-4" $width="100%">
        <OakHeading $font="heading-6" tag="h4" $color="black">
          {title}
        </OakHeading>

        <OakSmallPrimaryInvertedButton
          $textAlign={"start"}
          iconName="download"
          element={"a"}
          isTrailingIcon
          $wordWrap={"break-word"}
          $whiteSpace={"normal"}
          $pl={"spacing-0"}
          $mh={"spacing-0"}
          href={href}
          target="_blank"
        >
          <OakFlex $display={["flex", "none"]} $width={"100%"}>
            <OakP $font="heading-light-7">
              {buttonLabelMobile} ({fileExtension})
            </OakP>
          </OakFlex>
          <OakFlex $display={["none", "flex"]} $alignItems="center">
            <OakP $font="heading-light-7">
              {buttonLabel} ({fileExtension})
            </OakP>
          </OakFlex>
        </OakSmallPrimaryInvertedButton>
      </OakFlex>
    </OakFlex>
  );
}

const StyledMuxPlayer = styled(MuxPlayer)`
  width: 600px;
  height: 334px;
  @media (max-width: 1100px) {
    width: 100%;
    height: fit-content;
  }
`;

const StyledUL = styled(OakUL)`
  list-style-type: disc;

  padding-left: 20px;
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
          $top={["spacing-0", "spacing-0", "spacing-48"]}
          $alignSelf={"start"}
          $pv={["spacing-64"]}
          $display={["none", "none", "flex"]}
        >
          <HomePageNav />
        </OakGridArea>
        <OakGridArea
          $gap={"spacing-92"}
          $pv={["spacing-64"]}
          $colSpan={[12, 0, 7]}
        >
          <HomePageAboutAila pageData={pageData} user={user} track={track} />
        </OakGridArea>
      </OakGrid>
      {pageData?.giveFeedbackLink?.external && (
        <OakFlexWithBackground
          $flexDirection={["column", "row"]}
          $justifyContent={["center", "space-between"]}
          $alignItems={"center"}
          $gap="spacing-56"
          $pv={["spacing-0", "spacing-80"]}
          $background={"lavender30"}
          fullWidthBgColor={"lavender30"}
        >
          <OakFlex
            $pv={["spacing-80"]}
            $flexDirection="column"
            $gap="spacing-24"
          >
            <OakHeading id="give-feedback" $font="heading-4" tag="h2">
              Give feedback
            </OakHeading>
            <OakP $textAlign="left" $font="body-2">
              Aila is still in development, and we&apos;re the first to admit
              it&apos;s not perfect. It doesn&apos;t yet have all the features
              you&apos;ll want, and you may spot the odd glitch or mistake. It
              can&apos;t create images or model diagrams, though it can suggest
              where to find them. Like all AI tools, it&apos;s stronger in some
              subjects than others. We&apos;re improving Aila all the time, and
              your feedback helps us make it better for you and your pupils.
            </OakP>
            <OakSecondaryButton
              element="a"
              href={pageData.giveFeedbackLink.external}
              target="_blank"
              rel="noopener noreferrer"
              iconName="arrow-right"
              isTrailingIcon
            >
              Share feedback
            </OakSecondaryButton>
          </OakFlex>
          <OakFlex
            $display={["none", "flex"]}
            $maxWidth={"spacing-640"}
            $flexGrow={1}
            $pa={"spacing-24"}
          >
            <Image
              src={oakSupporting}
              alt="jigsaw image"
              style={{ width: "100%", height: "100%", objectFit: "fill" }}
            />
          </OakFlex>
        </OakFlexWithBackground>
      )}
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
  /* img {
    max-width: 300px;
  } */
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
        $gap={"spacing-20"}
      >
        <OakFlexCustomMaxWidthWithHalfWidth
          $flexDirection={"column"}
          $gap={"spacing-20"}
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

          <OakP $textAlign="left" $font="body-2">
            Transform your lesson prep with your free AI-powered lesson
            assistant, Aila. Whether it&apos;s creating bespoke resources or
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
      <OakFlex $flexDirection={"column"} $gap={"spacing-24"}>
        <OakHeading id="what-to-expect" $font="heading-5" tag="h3">
          What to expect
        </OakHeading>
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
        <OakP $font={"body-2"}>
          Aila, your AI-powered lesson assistant, can help you create
          high-quality lessons and teaching materials in minutes. When
          you&apos;re ready, you can download everything in several editable
          formats to adapt as you like.
        </OakP>
        <OakP $font={"body-2-bold"}>Lessons created with Aila include:</OakP>

        <StyledUL>
          <OakLI $mb={"spacing-8"}>1 lesson plan</OakLI>
          <OakLI $mb={"spacing-8"}>1 slide deck</OakLI>
          <OakLI $mb={"spacing-8"}>2 quizzes</OakLI>
          <OakLI>1 worksheet</OakLI>
        </StyledUL>

        <OakSecondaryButton
          iconName="arrow-right"
          isTrailingIcon
          element="a"
          href={getAilaUrl("start")}
        >
          Start creating with AI
        </OakSecondaryButton>

        <OakHeading
          id="sample-lessons"
          $mt={"spacing-32"}
          $font="heading-5"
          tag="h3"
        >
          Sample lessons
        </OakHeading>
        <OakP $font={"body-2"}>
          Explore sample lessons created with Aila by teachers like you to see
          what&apos;s possible. We don&apos;t currently include images in our AI
          lessons, but you can add your own once downloaded.
        </OakP>
        <OakFlex $flexDirection={"column"} $gap={"spacing-24"}>
          {pageData?.sampleLessons?.map((lesson, index) => (
            <IconInfoCardLink
              key={`${index}-${lesson.title}`}
              iconName={lesson.iconName}
              background={lesson.iconTileBackgroundColour}
              title={lesson.title}
              buttonLabel={lesson.fileName}
              buttonLabelMobile={lesson.mobileFileName ?? lesson.fileName}
              fileExtension={`.${lesson.file?.asset.extension ?? "zip"}`}
              href={lesson.file?.asset.url}
            />
          ))}
        </OakFlex>
        <OakHeading
          id="creating-a-lesson"
          $mt={"spacing-32"}
          $font="heading-5"
          tag="h3"
        >
          Creating a lesson
        </OakHeading>
        <OakFlex $flexDirection={"column"} $gap={"spacing-24"}>
          {pageData?.belowTheFoldVideo2?.video.asset.playbackId && (
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
                  pageData?.belowTheFoldVideo2?.video.asset.playbackId
                }
                thumbnailTime={51}
              />
            </OakBoxCustomMaxWidth>
          )}
          <OakP $textAlign="left" $font="body-2">
            Tell Aila what you want to teach and get step-by-step support to
            build your lesson. Start with your learning outcome, then adapt as
            you go - add or remove content, lower the reading age, or change the
            context to suit your school.
          </OakP>
          <OakP $textAlign="left" $font="body-2">
            Ask for different tasks or activities to suit your pupils, and
            download fully editable resources ready for your classroom.
          </OakP>
          {pageData?.promptExamples?.map((example, index) => (
            <IconInfoCardLink
              key={`${index}-${example.title}`}
              iconName={example.iconName}
              background={example.iconTileBackgroundColour}
              buttonLabel={example.fileName}
              buttonLabelMobile={example.mobileFileName ?? example.fileName}
              title={example.title}
              fileExtension={`.${example.file?.asset.extension ?? "pdf"}`}
              href={example.file?.asset.url}
            />
          ))}

          <OakSecondaryButton
            element="a"
            href={getAilaUrl("lesson")}
            isTrailingIcon
            iconName="arrow-right"
            onClick={() => {
              track.lessonAssistantAccessed({
                product: "ai lesson assistant",
                isLoggedIn: !!user.isSignedIn,
                componentType: "homepage_secondary_create_a_lesson_button",
              });
            }}
          >
            Create a lesson
          </OakSecondaryButton>
        </OakFlex>
        <OakFlex
          $mb={"spacing-24"}
          $flexDirection={"column"}
          $gap={"spacing-24"}
        >
          <OakHeading
            id="creating-teaching-materials"
            $mt={"spacing-32"}
            $font="heading-5"
            tag="h3"
          >
            Creating teaching materials
          </OakHeading>
          <OakP $textAlign="left" $font="body-2">
            Already planned your lesson? Ask Aila to create glossaries, tasks
            and quizzes in minutes to enhance an Oak lesson or your own. Then
            download your tailored resource - or ask Aila to tweak it to suit
            your pupils.
          </OakP>
          <OakSecondaryButton
            element={"a"}
            isTrailingIcon
            iconName="arrow-right"
            href={getAilaUrl("teaching-materials")}
          >
            Create teaching materials
          </OakSecondaryButton>
        </OakFlex>
        <OakFlex
          $mb={"spacing-24"}
          $flexDirection={"column"}
          $gap={"spacing-20"}
        >
          <OakHeading id="what-makes-aila-different" $font="heading-5" tag="h3">
            What makes Aila different
          </OakHeading>
          <OakP $textAlign="left" $font="body-2">
            Aila draws on our extensive library of national curriculum-aligned
            resources, designed and tested by teachers and subject experts. That
            means you get high-quality results made for UK pupils and
            classrooms.
          </OakP>

          <OakSecondaryButton
            isTrailingIcon
            iconName="arrow-right"
            element={"a"}
            href="/faqs"
          >
            Find out more about Aila
          </OakSecondaryButton>
        </OakFlex>
        <OakFlex
          $mb={"spacing-24"}
          $flexDirection={"column"}
          $gap={"spacing-48"}
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
          $mb={"spacing-24"}
          $flexDirection={"column"}
          $gap={"spacing-20"}
        >
          <OakHeading id="how-our-ai-works" $font="heading-5" tag="h3">
            How our AI works
          </OakHeading>
          <OakP $textAlign="left" $font="body-2">
            Our AI Experiments explore how AI can help create effective teaching
            resources and reduce your workload. We combine carefully designed
            prompts with our high-quality, national curriculum-aligned content
            to give you reliable results that are safe for your pupils. And your
            data is always kept secure.
          </OakP>
        </OakFlex>
      </OakFlex>
    </OakBox>
  );
}

const HomePageNav = () => {
  const menuItems = [
    { href: "#what-to-expect", label: "What to expect" },
    { href: "#sample-lessons", label: "Sample lessons" },
    { href: "#creating-a-lesson", label: "Creating a lesson" },
    {
      href: "#creating-teaching-materials",
      label: "Creating teaching materials",
    },
    { href: "#what-makes-aila-different", label: "What makes Aila different" },
    { href: "#how-our-ai-works", label: "How our AI works" },
    { href: "#give-feedback", label: "Give feedback" },
  ];

  return (
    <OakFlex $display="flex" $flexDirection="column" $gap="spacing-24">
      {menuItems.map((item) => (
        <OakTertiaryButton
          key={item.href}
          iconName="chevron-right"
          element="a"
          href={item.href}
        >
          {item.label}
        </OakTertiaryButton>
      ))}
    </OakFlex>
  );
};
