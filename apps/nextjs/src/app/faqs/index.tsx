"use client";

import { useRef } from "react";

import {
  OakBox,
  OakFlex,
  OakHeading,
  OakLI,
  OakLink,
  OakMaxWidth,
  OakP,
  OakUL,
} from "@oaknational/oak-components";

import GetInTouchBox from "@/components/AppComponents/GetInTouchBox";
import Layout from "@/components/Layout";
import { OakBoxCustomMaxWidth } from "@/components/OakBoxCustomMaxWidth";

const FAQPage = (featureFlag) => {
  const startingRef = useRef(null);
  const featuresRef = useRef(null);
  const supportRef = useRef(null);
  const usageRef = useRef(null);
  const accessibilityRef = useRef(null);
  const technicalRef = useRef(null);
  const updatesRef = useRef(null);
  const concernsRef = useRef(null);
  const dataRef = useRef(null);
  const scrollToRefWithOffset = (ref) => {
    if (ref && ref.current) {
      const yOffset = -72; // Adjust this value as needed
      const y =
        ref.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };
  return (
    <Layout featureFlag={featureFlag}>
      <OakMaxWidth>
        <OakFlex $justifyContent="space-between">
          <OakBox $display={["none", "block"]}>
            <OakBox $pb="inner-padding-xl8" $mb="space-between-xl">
              <OakHeading tag="h1" $font="heading-3">
                FAQs
              </OakHeading>
            </OakBox>

            <OakUL $position="sticky" $top="all-spacing-14">
              <OakLI $pv="inner-padding-ssx">
                <OakLink onClick={() => scrollToRefWithOffset(startingRef)}>
                  Getting started
                </OakLink>
              </OakLI>
              <OakLI $pv="inner-padding-ssx">
                <OakLink onClick={() => scrollToRefWithOffset(featuresRef)}>
                  Features and functionality
                </OakLink>
              </OakLI>
              <OakLI $pv="inner-padding-ssx">
                <OakLink onClick={() => scrollToRefWithOffset(supportRef)}>
                  Support and assistance
                </OakLink>
              </OakLI>
              <OakLI $pv="inner-padding-ssx">
                <OakLink
                  onClick={() => scrollToRefWithOffset(accessibilityRef)}
                >
                  Accessibility
                </OakLink>
              </OakLI>
              <OakLI $pv="inner-padding-ssx">
                <OakLink onClick={() => scrollToRefWithOffset(usageRef)}>
                  Usage and best practices
                </OakLink>
              </OakLI>
              <OakLI $pv="inner-padding-xs">
                <OakLink onClick={() => scrollToRefWithOffset(technicalRef)}>
                  Technical
                </OakLink>
              </OakLI>
              <OakLI $pv="inner-padding-xs">
                <OakLink onClick={() => scrollToRefWithOffset(updatesRef)}>
                  Updates and enhancements
                </OakLink>
              </OakLI>
              <OakLI $pv="inner-padding-xs">
                <OakLink onClick={() => scrollToRefWithOffset(concernsRef)}>
                  Other concerns
                </OakLink>
              </OakLI>
              <OakLI $pv="inner-padding-xs">
                <OakLink onClick={() => scrollToRefWithOffset(dataRef)}>
                  Data privacy and security
                </OakLink>
              </OakLI>
            </OakUL>
          </OakBox>

          <OakBoxCustomMaxWidth customMaxWidth={850}>
            <div className="mb-20">
              <GetInTouchBox />
            </div>

            <div ref={startingRef}>
              <OakHeading
                tag="h2"
                $font="heading-5"
                $mt="space-between-xxl"
                $mb="space-between-s"
              >
                Getting started
              </OakHeading>
            </div>

            <div className="mb-4">
              <OakHeading
                tag="h3"
                $font="body-1-bold"
                $mt="space-between-l"
                $mb="space-between-s"
              >
                How do I sign up for Aila?
              </OakHeading>
              <OakP>
                You can sign up to access Aila and our other AI experiments{" "}
                <OakLink href="/aila">here</OakLink>.
              </OakP>
              <OakHeading
                tag="h3"
                $font="body-1-bold"
                $mt="space-between-l"
                $mb="space-between-s"
              >
                How much does it cost to use Aila?
              </OakHeading>
              <OakP>
                As with all of Oak&apos;s resources, Aila is completely free to
                use. There are some fair use limits that we have applied that
                you may reach if your use appears to be excessive.
              </OakP>
              <OakHeading
                tag="h3"
                $font="body-1-bold"
                $mt="space-between-l"
                $mb="space-between-s"
              >
                What are the system requirements for using Aila?
              </OakHeading>
              <OakP>
                We aim to make our resources as accessible as possible. Aila
                will be available to any teacher with access to a laptop or
                computer and the Internet. We currently don&apos;t support
                mobile usage.
              </OakP>
              <OakHeading
                tag="h3"
                $font="body-1-bold"
                $mt="space-between-l"
                $mb="space-between-s"
              >
                What is a beta product?
              </OakHeading>
              <OakP>
                Aila is in the beta phase, and we are still actively testing and
                developing Aila. This phase helps identify issues by allowing
                teachers to use the Aila in real-life conditions. Aila is not
                perfect, and will make some mistakes!{" "}
                <OakLink href="https://docs.google.com/forms/d/e/1FAIpQLSf2AWtTtr4JISeMV4BY5LCMYhDFPz0RPNdXzmy_vjk4BmM69Q/viewform">
                  Your feedback is essential
                </OakLink>{" "}
                to refine and improve Aila.
              </OakP>
              <OakHeading
                tag="h3"
                $font="body-1-bold"
                $mt="space-between-m"
                $mb="space-between-l"
              >
                Is there a tutorial or guide available to help me get started?
              </OakHeading>
              <OakP>
                Aila provides helpful tips and prompts for getting started. If
                you need additional support, you can take a look at our{" "}
                <OakLink href="https://labs.thenational.academy/aila/help">
                  help
                </OakLink>{" "}
                section, or contact us.
              </OakP>
            </div>

            <div ref={featuresRef}>
              <OakHeading
                tag="h2"
                $font="heading-5"
                $mt="space-between-xxl"
                $mb="space-between-s"
              >
                Features and functionality
              </OakHeading>
            </div>

            <div className="mb-4">
              <OakHeading
                tag="h3"
                $font="body-1-bold"
                $mt="space-between-l"
                $mb="space-between-s"
              >
                What features does Aila offer?
              </OakHeading>
              <OakP>
                Aila offers a range of features to help teachers create
                high-quality lesson plans and resources. It is designed to
                ensure that lesson plans meet national curriculum standards. You
                can edit your lesson plan using Aila, quickly generating
                downloadable lesson plans, editable slide decks, and starter and
                exit quizzes. You may also choose to adapt or add to the
                resources after download.
              </OakP>
              <OakHeading
                tag="h3"
                $font="body-1-bold"
                $mt="space-between-l"
                $mb="space-between-s"
              >
                Can I customise lessons?
              </OakHeading>
              <OakP>
                Yes! Aila is designed to guide you through the process of
                co-creating a lesson. The more you specify to Aila, the better
                your lesson will be. You can ask Aila to adapt the lesson to
                suit your geographical context, the reading age of students in
                your class, or any other additional needs your pupils may have.
                The materials you produce with Aila are also fully editable.
              </OakP>
              <OakHeading
                tag="h3"
                $font="body-1-bold"
                $mt="space-between-l"
                $mb="space-between-s"
              >
                What are the advantages of using Aila?
              </OakHeading>
              <OakP $mb="space-between-s">
                Aila has been based upon Oak&apos;s{" "}
                <OakLink href="https://www.thenational.academy/blog/our-approach-to-curriculum">
                  curriculum principles
                </OakLink>{" "}
                Aila is designed to take you through the process that an expert
                teacher would use to plan a lesson; starting with your lesson
                outcome and breaking that down into manageable chunks of
                learning, our learning cycles.
              </OakP>
              <OakP $mb="space-between-s">
                It encourages you to think about the prior knowledge that
                students will require for the lesson, the vocabulary that will
                need to be explicitly taught during the lesson, the key
                knowledge that you want pupils to take from the lesson and the
                common misconceptions or errors that pupils make in this topic.
              </OakP>
              <OakP $mb="space-between-s">
                Our learning cycles are designed to ensure clear explanations -
                we provide image and slide text suggestions to allow for dual
                coding, we&apos;ve ensured slide design minimises extraneous
                cognitive load for students and built-in regular checks for
                understanding tasks followed by lots of practice for students.
              </OakP>
              <OakP $mb="space-between-s">
                The process is designed to be flexible. You can tweak and change
                the lesson as it is being created to suit the needs of your
                pupils, as you know them best! The beauty of Aila is that it
                won&apos;t produce your generic off-the-shelf lesson; it will
                help you craft a lesson that is accessible and appropriate for
                your students.
              </OakP>
              <OakP $mb="space-between-s">
                Aila uses a technique called retrieval augmented generation
                (RAG) to incorporate the high-quality Oak content, which has
                been carefully and expertly created by real-life teachers and
                quality-checked by subject experts. This should improve the
                accuracy of the lessons being produced. Aila has been designed
                for UK teachers so you are less likely to see Americanisms and
                the content will be more closely aligned with the English
                national curriculum.
              </OakP>
              <OakHeading
                tag="h3"
                $font="body-1-bold"
                $mt="space-between-l"
                $mb="space-between-s"
              >
                Why has Oak created Aila when other AI assistants are already
                available?
              </OakHeading>
              <OakP>
                Aila draws on existing Oak content, which has been carefully and
                expertly created by real-life teachers and quality-checked by
                subject experts. Aila has been designed around the Oak{" "}
                <OakLink href="https://www.thenational.academy/blog/our-approach-to-curriculum">
                  curriculum principles
                </OakLink>
                , which are national curriculum aligned and geared towards UK
                users. With Aila, you&apos;re less likely to see Americanisms,
                and the content will align much more closely with the
                requirements of teachers in England.
              </OakP>
              <OakHeading
                tag="h3"
                $font="body-1-bold"
                $mt="space-between-l"
                $mb="space-between-s"
              >
                What are the limitations of Aila&apos;s features?
              </OakHeading>
              <OakP $mb="space-between-s">
                We know that images are really important to support explanations
                and Aila doesn&apos;t currently produce images or diagrams.
                Image production is a feature that will come with a future
                iteration of Aila, but to help teachers with this aspect of
                lesson design, we currently provide an &apos;image
                suggestion&apos; to help you find an appropriate image with
                Google.
              </OakP>

              <OakP $mb="space-between-s">
                We are aware that complex concepts may require more than one
                slide to support their explanation. We are developing this
                feature but think this is the part of a lesson that will need
                the most development from a teacher after export.
              </OakP>

              <OakP $mb="space-between-s">
                Large Language Models are not as good at producing high-quality
                content for some subjects and this is a limitation of Aila. We
                know that the output isn&apos;t as good in certain subjects yet,
                in particular STEM subjects and modern foreign languages. We are
                actively working to improve these subjects.
              </OakP>
              <OakHeading
                tag="h3"
                $font="body-1-bold"
                $mt="space-between-l"
                $mb="space-between-s"
              >
                Why does Aila only output in Oak format?
              </OakHeading>
              <OakP>
                When designing Aila, we wanted pedagogical rigour to be at its
                core. Oak&apos;s lesson design is underpinned by research in
                learning and cognitive science, which has formed the structure
                of the lessons that Aila produces. All outputs are fully
                editable, so you can update them to your preferred formats.
              </OakP>
              <OakHeading
                tag="h3"
                $font="body-1-bold"
                $mt="space-between-l"
                $mb="space-between-s"
              >
                Why is there only one type of questioning in the quizzes?
              </OakHeading>
              <OakP>
                Multiple-choice questions are a really effective way of quickly
                assessing pupils&apos; mastery of content, but they take a
                really long time to write, so we have included lots to save you
                time. After export, you can edit these to remove the options and
                make them short answer questions or even add additional question
                types to your slides.
              </OakP>
              <OakP $mb="space-between-xs">
                Aila is still very much in development and we&apos;re aiming to
                add more question types in future.
              </OakP>
            </div>

            <div ref={supportRef}>
              <OakHeading
                tag="h2"
                $font="heading-5"
                $mt="space-between-xxl"
                $mb="space-between-s"
              >
                Support and assistance
              </OakHeading>
            </div>

            <div>
              <OakHeading
                tag="h3"
                $font="body-1-bold"
                $mt="space-between-l"
                $mb="space-between-s"
              >
                Is support available if I encounter any issues or have
                questions?
              </OakHeading>

              <OakP $mb="space-between-s">
                Yes, we provide comprehensive support to assist with any issues
                or questions users may have. You can contact us via
                <OakLink href="mailto:help@thenational.academy">email.</OakLink>
              </OakP>
              <OakHeading
                tag="h3"
                $font="body-1-bold"
                $mt="space-between-l"
                $mb="space-between-s"
              >
                Can I provide feedback or suggest improvements for Aila?
              </OakHeading>
              <OakP $mb="space-between-s">
                Yes, please do! We love to hear how users are finding our
                resources and how we can improve them. Submit your{" "}
                <OakLink href="https://docs.google.com/forms/d/e/1FAIpQLSf2AWtTtr4JISeMV4BY5LCMYhDFPz0RPNdXzmy_vjk4BmM69Q/viewform">
                  feedback or suggestions{" "}
                </OakLink>
                .
              </OakP>

              <OakHeading
                tag="h3"
                $font="body-1-bold"
                $mt="space-between-l"
                $mb="space-between-s"
              >
                Are there resources available for troubleshooting common
                problems?
              </OakHeading>
              <OakP $mb="space-between-s">
                The more feedback we receive from users, the more we can
                identify common problems and provide troubleshooting tips.
              </OakP>
            </div>

            <div ref={accessibilityRef}>
              <OakHeading
                tag="h2"
                $font="heading-5"
                $mt="space-between-xxl"
                $mb="space-between-s"
              >
                Accessibility
              </OakHeading>
            </div>

            <div>
              <OakHeading
                tag="h3"
                $font="body-1-bold"
                $mt="space-between-l"
                $mb="space-between-s"
              >
                Are there features in place to support diverse learners and
                educators?
              </OakHeading>
              <OakP $mb="space-between-s">
                We want as many people as possible to be able to use Aila. You
                should be able to; change colours, contrast levels, and fonts;
                read and use most of the website while zoomed in up to 400%;
                navigate most of the website using just a keyboard; navigate
                most of the website using speech recognition software; listen to
                most of the website using a screen reader (including the most
                recent versions of JAWS, NVDA, and VoiceOver). View our{" "}
                <OakLink href="https://labs.thenational.academy/legal/accessibility-statement">
                  full accessibility statement
                </OakLink>
                .
              </OakP>
              <OakHeading
                tag="h3"
                $font="body-1-bold"
                $mt="space-between-l"
                $mb="space-between-s"
              >
                Can lesson plans be adapted for students with SEND?
              </OakHeading>
              <OakP $mb="space-between-s">
                Of course! You can prompt Aila to factor in your pupils&apos;
                needs when generating your lesson plan. Try asking Aila to
                produce texts of different reading ages, sentence starters, or
                alternative activities to support pupils during the additional
                materials section of the lesson. You are also able to download
                and edit all resources after you have created your lesson.
              </OakP>
            </div>

            <div ref={usageRef}>
              <OakHeading
                tag="h2"
                $font="heading-5"
                $mt="space-between-xxl"
                $mb="space-between-s"
              >
                Usage and best practices
              </OakHeading>
            </div>

            <div>
              <OakHeading
                tag="h3"
                $font="body-1-bold"
                $mt="space-between-l"
                $mb="space-between-s"
              >
                What are some best practices for maximising the effectiveness of
                Aila?
              </OakHeading>
              <OakP $mb="space-between-s">
                Work with Aila to co-create your lesson. Before you proceed to
                the next steps of co-creating your lesson with Aila, it is
                important to check that you are happy with your lesson outcomes
                and learning cycle outcomes, as this will determine the content
                for the rest of the lesson.
              </OakP>
              <OakP $mb="space-between-s">
                If you want the content to be adapted for a specific
                geographical context, reading age or a specific pupil need, tell
                Aila at the start so that that is taken into consideration when
                designing the lesson content.
              </OakP>
              <OakP $mb="space-between-s">
                The additional materials section of the lesson is the most
                flexible. If you would like teacher instructions for a practical
                lesson, model answers, essay-style questions, narratives for
                your explanations or texts differentiated by reading age for
                your classes, just ask at the end of the lesson planning process
                and Aila will create these for you.
              </OakP>
            </div>

            <div ref={technicalRef}>
              <OakHeading
                tag="h2"
                $font="heading-5"
                $mt="space-between-xxl"
                $mb="space-between-s"
              >
                Technical
              </OakHeading>
            </div>

            <div>
              <OakHeading
                tag="h3"
                $font="body-1-bold"
                $mt="space-between-l"
                $mb="space-between-s"
              >
                How does Aila work?
              </OakHeading>
              <OakP $mb="space-between-s">
                Aila is built to use Chat GPT4, but we are also evaluating other
                models. We have written a 9,000-word prompt that provides very
                specific guidance on what excellence looks like for each section
                of a lesson.
              </OakP>
              <OakP $mb="space-between-s">
                Aila also uses retrieval augmented generation (RAG) to integrate
                the high-quality content of Oak&apos;s human-planned lessons
                into the lessons being delivered. This means that the accuracy
                of the content produced should be closely aligned with the needs
                of teachers in England.
              </OakP>
            </div>

            <div ref={updatesRef}>
              <OakHeading
                tag="h2"
                $font="heading-5"
                $mt="space-between-xxl"
                $mb="space-between-s"
              >
                Updates and enhancements
              </OakHeading>
            </div>

            <div>
              <OakHeading
                tag="h3"
                $font="body-1-bold"
                $mt="space-between-l"
                $mb="space-between-s"
              >
                Are there plans for future enhancements or new features?
              </OakHeading>
              <OakP $mb="space-between-s">
                Yes, we strive to constantly improve our resources, taking into
                account feedback from our users - Aila is still very much in
                development. We aim to release future iterations of Aila that
                produce images and diagrams. We are also developing Aila to
                ensure that it has pedagogical rigour for a range of different
                subjects.
              </OakP>
              <OakHeading
                tag="h3"
                $font="body-1-bold"
                $mt="space-between-l"
                $mb="space-between-s"
              >
                Can users suggest features for future updates?
              </OakHeading>
              <OakP $mb="space-between-s">
                Of course, we would love to hear your thoughts and suggestions
                for other features that would support your teaching. Please{" "}
                <OakLink href="https://docs.google.com/forms/d/e/1FAIpQLSf2AWtTtr4JISeMV4BY5LCMYhDFPz0RPNdXzmy_vjk4BmM69Q/viewform">
                  give us your feedback!
                </OakLink>
              </OakP>

              <OakHeading
                tag="h3"
                $font="body-1-bold"
                $mt="space-between-l"
                $mb="space-between-s"
              >
                How often are updates released for Aila?
              </OakHeading>
              <OakP $mb="space-between-s">
                We&apos;re still in the beta phase, which means that whilst
                we&apos;re allowing teachers to use it, it&apos;s still prone to
                bugs and errors, and is still under constant development.
                We&apos;re constantly receiving feedback and aim to improve and
                iterate on an almost daily basis!
              </OakP>

              <OakHeading
                tag="h3"
                $font="body-1-bold"
                $mt="space-between-l"
                $mb="space-between-s"
              >
                How will Aila be evaluated?
              </OakHeading>
              <OakP $mb="space-between-s">
                The team at Oak constantly evaluates Aila, and we are designing
                multiple approaches to this. We carry out consistency checks and
                ensure that it follows the instructions we have built into the
                prompt, and evaluate the quality of content being produced.
              </OakP>
              <OakP $mb="space-between-s">
                We aim to evaluate several factors, such as Americanisms,
                cultural biases, the appropriateness of the literacy level,
                checking that the learning cycles increase in difficulty, and
                more.
              </OakP>
              <OakP $mb="space-between-s">
                Nonetheless, generative AI will make mistakes, and the outputs
                should be checked carefully.
              </OakP>
            </div>

            <div ref={concernsRef}>
              <OakHeading
                tag="h2"
                $font="heading-5"
                $mt="space-between-xxl"
                $mb="space-between-s"
              >
                Other concerns
              </OakHeading>
            </div>

            <div>
              <OakHeading
                tag="h3"
                $font="body-1-bold"
                $mt="space-between-l"
                $mb="space-between-s"
              >
                Is Oak trying to replace teachers with AI?
              </OakHeading>
              <OakP $mb="space-between-s">
                Absolutely not! At Oak, we share the brilliance of teachers from
                across the country through our resources, and our Aila is no
                different. It is designed to keep teachers in the driving seat,
                with support from AI to reduce their workload.
              </OakP>
            </div>

            <div ref={dataRef}>
              <OakHeading
                tag="h2"
                $font="heading-5"
                $mt="space-between-xxl"
                $mb="space-between-s"
              >
                Data privacy and security
              </OakHeading>
            </div>

            <div>
              <OakHeading
                tag="h3"
                $font="body-1-bold"
                $mt="space-between-l"
                $mb="space-between-s"
              >
                Is Aila safe to use?
              </OakHeading>
              <OakP $mb="space-between-s">
                Generative AI will make mistakes, and no two outputs are the
                same. With that in mind, it&apos;s important to check any
                AI-generated content thoroughly before using it in the
                classroom. We have put in place a number of technical and policy
                measures to minimise the risks that generative AI presents but
                care should still be taken, for example, you must not input
                personally identifiable information into Aila, and this is in
                breach of the terms and conditions of use.
              </OakP>

              <OakHeading
                tag="h3"
                $font="body-1-bold"
                $mt="space-between-l"
                $mb="space-between-s"
              >
                Can I have unlimited use?
              </OakHeading>
              <OakP $mb="space-between-s">
                In order to prevent misuse, we&apos;ve restricted and protected
                the volume of requests that can be made, lessons, and resources
                that can be generated. If you&apos;re reaching these limits,
                we&apos;d love to hear from you, and you can{" "}
                <OakLink href="https://forms.gle/tHsYMZJR367zydsG8">
                  request a higher limit.
                </OakLink>
              </OakP>

              <OakHeading
                tag="h3"
                $font="body-1-bold"
                $mt="space-between-l"
                $mb="space-between-s"
              >
                What ethical measures are you putting in place?
              </OakHeading>
              <OakP $mb="space-between-s">
                Generative AI is a new and cutting-edge technology, and
                it&apos;s important that anyone developing AI products actively
                takes into account privacy, security and ethical considerations.
                We have looked into emerging guidance and governance on
                generative AI, including;
              </OakP>
              <OakUL className="mb-6 list-disc pl-12">
                <OakLI $pv="inner-padding-xs">
                  UNESCO&apos;s core principles on{" "}
                  <OakLink href="https://www.unesco.org/en/artificial-intelligence/recommendation-ethics">
                    a human-rights centred approach to the Ethics of AI
                  </OakLink>
                </OakLI>
                <OakLI $pv="inner-padding-xs">
                  US office for Edtech;{" "}
                  <OakLink href="https://tech.ed.gov/ai/">
                    Artificial Intelligence and the Future of Teaching and
                    Learning
                  </OakLink>
                </OakLI>
                <OakLI $pv="inner-padding-xs">
                  UK DfE position on{" "}
                  <OakLink href="https://www.gov.uk/government/publications/generative-artificial-intelligence-in-education/generative-artificial-intelligence-ai-in-education">
                    Generative artificial intelligence (AI) in education
                  </OakLink>
                </OakLI>
              </OakUL>
              <OakP $mb="space-between-s">Aila is designed to:</OakP>
              <OakUL className="mb-6 list-disc pl-12">
                <OakLI $pv="inner-padding-xs">
                  <OakP>
                    keep the human in the loop, informing and involving expert
                    teachers and educators in the process
                  </OakP>
                </OakLI>
                <OakLI $pv="inner-padding-xs">
                  <OakP>
                    not involve the input of personal information to LLMs
                  </OakP>
                </OakLI>
                <OakLI $pv="inner-padding-xs">
                  <OakP>
                    allow us to evaluate cultural biases that may be present in
                    the generated content
                  </OakP>
                </OakLI>
                <OakLI $pv="inner-padding-xs">
                  <OakP>
                    create guardrails around the generative AI to improve
                    pedagogical alignment
                  </OakP>
                </OakLI>
                <OakLI $pv="inner-padding-xs">
                  <OakP>
                    be transparent and explainable to users; we openly share the
                    underlying prompts
                  </OakP>
                </OakLI>
              </OakUL>
            </div>

            <div ref={concernsRef}>
              <OakHeading
                tag="h2"
                $font="heading-5"
                $mt="space-between-xxl"
                $mb="space-between-s"
              >
                Aila
              </OakHeading>
            </div>

            <div>
              <OakHeading
                tag="h3"
                $font="body-1-bold"
                $mt="space-between-l"
                $mb="space-between-s"
              >
                Why did you decide to name Oak&apos;s AI lesson assistant, Aila?
              </OakHeading>
              <OakP $mb="space-between-s">
                The name is an acronym for &apos;AI lesson assistant&apos;. We
                wanted the name to have &apos;AI&apos; in it, as our research
                found that teachers would be more likely to use an AI product if
                it was clear that it was AI-powered and could save them time.
                Further research into the name led to some deeper connections
                which helped to solidify our decision. &apos;Aila&apos; means
                &apos;oak tree&apos; in Hebrew, and in Scottish Gaelic, Aila
                means &apos;from the strong place&apos;. We believe the rigour
                and quality of Aila stems from the strong foundation provided by
                both Oak&apos;s strong curriculum principles and the
                high-quality, teacher-generated content that we have been able
                to integrate into the lesson development process.
              </OakP>
              <OakHeading
                tag="h3"
                $font="body-1-bold"
                $mt="space-between-l"
                $mb="space-between-s"
              >
                Why did you give it a human name?
              </OakHeading>
              <OakP $mb="space-between-s">
                In Aila&apos;s initial testing phases, users reported being
                unsure of how to &apos;talk&apos; to the assistant. Giving it a
                name humanises the chatbot and encourages more natural
                conversation.
              </OakP>
            </div>
          </OakBoxCustomMaxWidth>
        </OakFlex>
      </OakMaxWidth>
    </Layout>
  );
};

export default FAQPage;
