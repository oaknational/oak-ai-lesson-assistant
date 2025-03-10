"use client";

import Image from "next/image";

import Layout from "@/components/Layout";

export const LessonPlannerPage = () => {
  return (
    <Layout>
      <div className="relative -mt-26 w-full bg-lemon30 py-28 before:absolute before:left-[-50vw] before:top-0 before:z-[-1] before:h-full before:w-[150vw] before:bg-lemon30">
        <h1 className="mb-10 text-center text-5xl font-bold">
          AI Lesson Planning Assistant
        </h1>
        <p className="mb-20 text-center text-4xl font-light opacity-80">
          Coming Soon...
        </p>
        <div className="mb-30 text-center">
          <p className="m-auto max-w-[650px]">
            Loved using our Lesson Planner? We&apos;ve been working behind the
            scenes to produce a new upgraded version and we are really excited
            for it&apos;s launch it in the coming weeks.
          </p>
        </div>
        <div className="mb-30 flex justify-center text-center">
          <span>
            <Image
              className="shadow-xl"
              src="/images/ai-assistant-screenshot.png"
              alt="AI Assistant Screenshot"
              width={900}
              height={400}
            />
          </span>
        </div>
        <div>
          <div>
            <p className="mx-auto mb-30 max-w-[650px] text-center">
              Our new <b>Lesson Planning Assistant</b> is designed to take the
              heavy lifting out of planning lessons whilst maintaining the
              pedagogical integrity of the planning process. It will put you, as
              the expert, in the driving seat. After choosing the topic and key
              stage, it will generate every part of your lesson for you,
              encouraging you to tweak and change the lesson plan as it is being
              built to suit your context and the needs of the students in your
              class.
            </p>
            <div className="text-center">
              <p>You will be able to export:</p>
              <ul>
                <li>
                  <p className="my-6 font-bold">
                    A PDF and Word Doc version of your lesson plan
                  </p>
                </li>
                <li>
                  <p className="my-6 font-bold">
                    A PDF and Word Doc version of your starter and exit quiz
                  </p>
                </li>
                <li>
                  <p className="my-6 font-bold">
                    Slides of your lesson content
                  </p>
                </li>
                <li>
                  <p className="my-6 font-bold">
                    A PDF and Word Doc version of your additional materials
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-30 flex justify-center text-center">
          <span>
            <Image
              className="shadow-xl"
              src="/images/chat-screenshot.png"
              alt="AI Assistant Screenshot"
              width={900}
              height={400}
            />
          </span>
        </div>
      </div>
    </Layout>
  );
};

export default LessonPlannerPage;
