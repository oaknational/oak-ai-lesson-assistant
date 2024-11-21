"use client";

import { useRef } from "react";

import { OakLink } from "@oaknational/oak-components";
import { useSearchParams } from "next/navigation";

import { Header } from "@/components/AppComponents/Chat/header";
import GetInTouchBox from "@/components/AppComponents/GetInTouchBox";

export const HelpContent = () => {
  const startingRef = useRef(null);
  const structureRef = useRef(null);
  const downloadsRef = useRef(null);
  const creatingRef = useRef(null);
  const reviewingRef = useRef(null);
  const downloadingRef = useRef(null);
  const aiRef = useRef(null);

  const scrollToRefWithOffset = (ref) => {
    if (ref && ref.current) {
      const yOffset = -72; // Adjust this value as needed
      const y =
        ref.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const searchParams = useSearchParams();
  const ailaId = searchParams.get("ailaId");

  return (
    <>
      <div className="mx-auto mt-30 h-[100vh] w-full max-w-[1280px] px-9">
        <div className="mb-27 flex justify-between gap-3">
          <div className="hidden  sm:block sm:min-w-[300px]">
            <h1 className="mb-24 text-4xl font-bold">Help</h1>
            <ul className="relative top-32 sm:sticky ">
              <li>
                <button
                  className="mb-14 text-blue underline"
                  onClick={() => scrollToRefWithOffset(startingRef)}
                >
                  Starting your first lesson
                </button>
              </li>
              <li>
                <button
                  className="mb-14 text-blue underline"
                  onClick={() => scrollToRefWithOffset(structureRef)}
                >
                  Structure of an Oak lesson
                </button>
              </li>
              <li>
                <button
                  className="mb-14 text-blue underline"
                  onClick={() => scrollToRefWithOffset(downloadsRef)}
                >
                  Downloads
                </button>
              </li>
              <li>
                <button
                  className="mb-14 text-blue underline"
                  onClick={() => scrollToRefWithOffset(creatingRef)}
                >
                  Co-creating your lesson
                </button>
              </li>
              <li>
                <button
                  className="mb-14 text-blue underline"
                  onClick={() => scrollToRefWithOffset(reviewingRef)}
                >
                  Reviewing and editing
                </button>
              </li>
              <li>
                <button
                  className="mb-14 text-blue underline"
                  onClick={() => scrollToRefWithOffset(downloadingRef)}
                >
                  Downloading and sharing
                </button>
              </li>
              <li>
                <button
                  className="mb-14 text-blue underline"
                  onClick={() => scrollToRefWithOffset(aiRef)}
                >
                  AI and accuracy
                </button>
              </li>
            </ul>
          </div>

          <div className="mb-40 max-w-[800px]">
            <div className="mb-20 mt-10 sm:hidden">
              <OakLink
                href={ailaId ? `/aila/${ailaId}` : "/aila"}
                iconName="chevron-left"
              >
                Back to Aila
              </OakLink>
            </div>

            <div className="mb-20">
              <GetInTouchBox />
            </div>
            <h2 className="mb-4  text-2xl font-bold" ref={startingRef}>
              Starting your first lesson
            </h2>
            <p className="mb-4">
              Create your first lesson by typing a lesson title and key stage
              into the input box on the first screen and clicking the arrow key.
              This will create the starting point of your lesson. You can get
              back to the initial screen by clicking &apos;New lesson&apos; in
              the main navigation.
            </p>
            <h2 className="mb-8 mt-20 text-2xl font-bold" ref={structureRef}>
              Structure of an Oak lesson
            </h2>
            <p className="mb-8">
              Lessons are created using Oak&apos;s curriculum principles and
              include the following sections:
            </p>
            <ul className="mb-6 list-disc pl-12">
              <li>Learning outcome</li>
              <li>Learning cycle outcomes</li>
              <li>Prior knowledge</li>
              <li>Key learning points</li>
              <li>Misconceptions</li>
              <li>Starter quiz</li>
              <li>Learning cycles</li>
              <li>Exit quiz</li>
              <li>Additional materials (optional)</li>
            </ul>
            <h2 className="mb-8 mt-20 text-2xl font-bold">Learning cycles</h2>
            <p className="mb-4">Each learning cycle includes 4 key sections:</p>
            <ul className="mb-6 list-disc pl-12">
              <li>Explanation</li>
              <li>Checks for understanding</li>
              <li>Practice</li>
              <li>Feedback</li>
            </ul>
            <h2 className="mb-8 mt-20 text-2xl font-bold" ref={downloadsRef}>
              Downloads
            </h2>
            <p className="mb-4">
              Once the lesson has been created (and all sections are complete)
              you will be able to download the following documents:
            </p>
            <ul className="mb-6 list-disc pl-12">
              <li>Lesson, including all sections (PDF/Docx file)</li>
              <li>Starter quiz (PDF/Docx file)</li>
              <li>Slides (PDF/PPTX file)</li>
              <li>Exit quiz (PDF/Docx file)</li>
            </ul>
            <p className="mb-4">
              If you have a Google account, you will also be able to edit these
              documents directly.
            </p>
            <h2 className="mb-8 mt-20 text-2xl font-bold">
              Examples of additional materials
            </h2>
            <p className="mb-4">
              Health and safety information, lesson narration, model answers or
              additional practice tasks.
            </p>
            <h2 className="mb-8 mt-20 text-2xl font-bold" ref={creatingRef}>
              Co-creating your lesson
            </h2>
            <p className="mb-4">
              Aila, Oak&apos;s AI lesson assistant will guide you through the
              process of co-creating each section of your lesson on the
              left-hand side of the screen. The lesson output will be generated
              on the right-hand side.
            </p>
            <h2 className="mb-8 mt-20 text-2xl font-bold" ref={reviewingRef}>
              Reviewing and editing
            </h2>
            <p className="mb-4">
              Aila will pause at key points during the lesson creation and will
              ask you to review the content generated. You can ask Aila to adapt
              each section, for example:
            </p>
            <ul className="mb-6 list-disc pl-12">
              <li>adapt the content for a specific reading age.</li>
              <li>
                add specific case studies or examples to your explanations.
              </li>
              <li>change the practice tasks for you.</li>
              <li>
                add a narrative for each learning cycle to the Additional
                Materials.
              </li>
            </ul>
            <h2 className="mb-8 mt-20 text-2xl font-bold" ref={downloadingRef}>
              Downloading and sharing
            </h2>
            <p className="mb-4">
              When you have completed all the sections in the lesson, you will
              be able to download the lesson resources, including the full
              lesson plan (which includes all sections), editable slides and
              starter and exit quizzes. You can also share your lesson as a
              link, which can be viewed online.
            </p>
            <h2 className="mb-8 mt-20 text-2xl font-bold" ref={aiRef}>
              AI and accuracy
            </h2>
            <p className="mb-4">
              Retrieval Augmented Generation is used to integrate Oak content
              into your lessons, improving the accuracy of the content produced.
              AI is not 100% accurate and mistakes can still be made. Remember,
              you&apos;re still the expert, so please ensure all content is
              reviewed before using it in a classroom or sharing.
            </p>
          </div>
        </div>
      </div>
    </>
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
