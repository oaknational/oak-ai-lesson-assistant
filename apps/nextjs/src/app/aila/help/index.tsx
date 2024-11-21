"use client";

import { useRef, type MutableRefObject } from "react";

import {
  OakBox,
  OakFlex,
  OakGrid,
  OakGridArea,
  OakHeading,
  OakLI,
  OakLink,
  OakMaxWidth,
  OakP,
  OakUL,
} from "@oaknational/oak-components";
import { useSearchParams } from "next/navigation";

import { Header } from "@/components/AppComponents/Chat/header";
import GetInTouchBox from "@/components/AppComponents/GetInTouchBox";
import Layout from "@/components/Layout";

export const HelpContent = () => {
  const startingRef = useRef(null);
  const structureRef = useRef(null);
  const learningCycles = useRef(null);
  const downloadsRef = useRef(null);
  const additionalMaterialsRef = useRef(null);
  const creatingRef = useRef(null);
  const reviewingRef = useRef(null);
  const downloadingRef = useRef(null);
  const aiRef = useRef(null);

  const scrollToRefWithOffset = (ref: MutableRefObject<HTMLElement | null>) => {
    if (ref && ref.current) {
      const yOffset = -72; // Adjust this value as needed
      const y =
        ref.current.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const searchParams = useSearchParams();
  const ailaId = searchParams.get("ailaId");

  return (
    <Layout>
      <OakMaxWidth>
        <OakGrid>
          <OakGridArea $colSpan={[0, 0, 3]}>
            <OakBox $display={["none", "none", "block"]}>
              <OakBox $position={"fixed"}>
                <OakBox $pb="inner-padding-xl">
                  <OakHeading tag="h1" $font="heading-3">
                    Help
                  </OakHeading>
                </OakBox>
                <OakUL>
                  <OakLI $pv="inner-padding-xs">
                    <OakLink onClick={() => scrollToRefWithOffset(startingRef)}>
                      Starting your first lesson
                    </OakLink>
                  </OakLI>
                  <OakLI $pv="inner-padding-xs">
                    <OakLink
                      onClick={() => scrollToRefWithOffset(structureRef)}
                    >
                      Structure of an Oak lesson
                    </OakLink>
                  </OakLI>
                  <OakLI $pv="inner-padding-xs">
                    <OakLink
                      onClick={() => scrollToRefWithOffset(learningCycles)}
                    >
                      Learning cycles
                    </OakLink>
                  </OakLI>
                  <OakLI $pv="inner-padding-xs">
                    <OakLink
                      onClick={() => scrollToRefWithOffset(downloadsRef)}
                    >
                      Downloads
                    </OakLink>
                  </OakLI>
                  <OakLI $pv="inner-padding-xs">
                    <OakLink
                      onClick={() =>
                        scrollToRefWithOffset(additionalMaterialsRef)
                      }
                    >
                      Examples of additional materials
                    </OakLink>
                  </OakLI>
                  <OakLI $pv="inner-padding-xs">
                    <OakLink onClick={() => scrollToRefWithOffset(creatingRef)}>
                      Co-creating your lesson
                    </OakLink>
                  </OakLI>
                  <OakLI $pv="inner-padding-xs">
                    <OakLink
                      onClick={() => scrollToRefWithOffset(reviewingRef)}
                    >
                      Reviewing and editing
                    </OakLink>
                  </OakLI>
                  <OakLI $pv="inner-padding-xs">
                    <OakLink
                      onClick={() => scrollToRefWithOffset(downloadingRef)}
                    >
                      Downloading and sharing
                    </OakLink>
                  </OakLI>
                  <OakLI $pv="inner-padding-xs">
                    <OakLink onClick={() => scrollToRefWithOffset(aiRef)}>
                      AI and accuracy
                    </OakLink>
                  </OakLI>
                </OakUL>
              </OakBox>
            </OakBox>
          </OakGridArea>
          <OakGridArea $colStart={[0, 0, 5]} $colSpan={[12, 12, 9]}>
            <OakFlex
              $flexDirection={"column"}
              $position={"relative"}
              $gap={"space-between-m2"}
            >
              <OakBox $display={["block", "none", "none"]}>
                <OakLink
                  href={ailaId ? `/aila/${ailaId}` : "/aila"}
                  iconName="chevron-left"
                >
                  Back to Aila
                </OakLink>
              </OakBox>

              <OakBox $mb={"space-between-xs"}>
                <GetInTouchBox />
              </OakBox>
              <OakBox ref={startingRef}>
                <OakHeading
                  $mb={"space-between-ssx"}
                  $font="heading-5"
                  tag="h2"
                >
                  Starting your first lesson
                </OakHeading>
                <OakP>
                  Create your first lesson by typing a lesson title and key
                  stage into the input box on the first screen and clicking the
                  arrow key. This will create the starting point of your lesson.
                  You can get back to the initial screen by clicking &apos;New
                  lesson&apos; in the main navigation.
                </OakP>
              </OakBox>
              <OakBox ref={structureRef}>
                <OakHeading $mb={"space-between-xs"} $font="heading-5" tag="h2">
                  Structure of an Oak lesson
                </OakHeading>
                <OakP $mb={"space-between-xs"}>
                  Lessons are created using Oak&apos;s curriculum principles and
                  include the following sections:
                </OakP>
                <OakUL className="mb-6 list-disc pl-12">
                  <OakLI>Learning outcome</OakLI>
                  <OakLI>Learning cycle outcomes</OakLI>
                  <OakLI>Prior knowledge</OakLI>
                  <OakLI>Key learning points</OakLI>
                  <OakLI>Misconceptions</OakLI>
                  <OakLI>Starter quiz</OakLI>
                  <OakLI>Learning cycles</OakLI>
                  <OakLI>Exit quiz</OakLI>
                  <OakLI>Additional materials (optional)</OakLI>
                </OakUL>
              </OakBox>
              <OakBox ref={learningCycles}>
                <OakHeading $mb={"space-between-xs"} $font="heading-5" tag="h2">
                  Learning cycles
                </OakHeading>
                <OakP $mb={"space-between-xs"}>
                  Each learning cycle includes 4 key sections:
                </OakP>
                <OakUL className="mb-6 list-disc pl-12">
                  <OakLI>Explanation</OakLI>
                  <OakLI>Checks for understanding</OakLI>
                  <OakLI>Practice</OakLI>
                  <OakLI>Feedback</OakLI>
                </OakUL>
              </OakBox>
              <OakBox ref={downloadsRef}>
                <OakHeading $mb={"space-between-xs"} $font="heading-5" tag="h2">
                  Downloads
                </OakHeading>
                <OakP $mb={"space-between-xs"}>
                  Once the lesson has been created (and all sections are
                  complete) you will be able to download the following
                  documents:
                </OakP>
                <OakUL className="mb-6 list-disc pl-12">
                  <OakLI>Lesson plan, including all sections</OakLI>
                  <OakLI>Starter quiz (PDF/Docx file)</OakLI>
                  <OakLI>Slides (PDF/PPTX file)</OakLI>
                  <OakLI>Worksheet (PDF/Docx file)</OakLI>
                  <OakLI>Exit quiz (PDF/Docx file)</OakLI>
                  <OakLI>Additional materials (PDF/Docx file)</OakLI>
                </OakUL>
                <OakP $mt={"space-between-xs"}>
                  If you have a Google account, you will also be able to edit
                  these documents directly.
                </OakP>
              </OakBox>
              <OakBox ref={additionalMaterialsRef}>
                <OakHeading $mb={"space-between-xs"} $font="heading-5" tag="h2">
                  Examples of additional materials
                </OakHeading>
                <OakP $mb={"space-between-xs"}>
                  Case study context sheet, an essay title with success criteria
                  for pupils to complete for homework, suggestions for
                  alternative art or equipment you can use for your lesson.
                </OakP>
              </OakBox>
              <OakBox ref={creatingRef}>
                <OakHeading $mb={"space-between-xs"} $font="heading-5" tag="h2">
                  Co-creating your lesson
                </OakHeading>
                <OakP $mb={"space-between-xs"}>
                  Aila, Oak&apos;s AI lesson assistant will guide you through
                  the process of co-creating each section of your lesson on the
                  left-hand side of the screen. The lesson output will be
                  generated on the right-hand side.
                </OakP>
              </OakBox>
              <OakBox ref={reviewingRef}>
                <OakHeading $mb={"space-between-xs"} $font="heading-5" tag="h2">
                  Reviewing and editing
                </OakHeading>
                <OakP $mb={"space-between-xs"}>
                  Aila will pause at key points during the lesson creation and
                  will ask you to review the content generated. You can ask Aila
                  to adapt each section, for example:
                </OakP>
                <OakUL className="mb-6 list-disc pl-12">
                  <OakLI>
                    increase or decrease the literacy level of your keywords
                  </OakLI>
                  <OakLI>
                    add specific case studies or examples to your explanations
                  </OakLI>
                  <OakLI>change the practice tasks for you</OakLI>
                  <OakLI>
                    add a narrative for each learning cycle to the Additional
                    Materials
                  </OakLI>
                </OakUL>
              </OakBox>
              <OakBox ref={downloadingRef}>
                <OakHeading $mb={"space-between-xs"} $font="heading-5" tag="h2">
                  Downloading and sharing
                </OakHeading>
                <OakP $mb={"space-between-xs"}>
                  Once you’ve completed all the sections in the lesson, you’ll
                  be able to download the full set of lesson resources. This
                  includes the complete lesson plan (covering all sections),
                  editable slides, starter and exit quizzes, a worksheet with
                  your practice tasks, and any additional materials you’ve
                  created. You can also share your lesson via a link, allowing
                  it to be viewed online.
                </OakP>
              </OakBox>
              <OakBox ref={aiRef}>
                <OakHeading $mb={"space-between-xs"} $font="heading-5" tag="h2">
                  AI and accuracy
                </OakHeading>
                <OakP $mb={"space-between-xs"}>
                  Retrieval augmented generation is used to integrate Oak
                  content into your lessons, improving the accuracy of the
                  content produced. AI is not 100% accurate and mistakes can
                  still be made. Remember, you&apos;re still the expert, so
                  please ensure all content is reviewed before using it in a
                  classroom or sharing.
                </OakP>
              </OakBox>
            </OakFlex>
          </OakGridArea>
        </OakGrid>
      </OakMaxWidth>
    </Layout>
  );
};

export default function HelpPage() {
  return (
    <>
      <Header />
      <HelpContent />
    </>
  );
}
