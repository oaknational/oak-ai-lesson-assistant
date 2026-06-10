import {
  OakAccordion,
  OakBox,
  OakFlex,
  OakLink,
  OakP,
  OakSpan,
} from "@oaknational/oak-components";
import type { OakAccordionProps } from "@oaknational/oak-components";

type AilaFaqAccordionProps = Pick<
  OakAccordionProps,
  "id" | "header" | "$bt" | "$bb" | "$pb" | "$color"
> & {
  readonly children: React.ReactNode;
};

function AilaFaqAccordion({
  id,
  header,
  $bt,
  $bb,
  $pb,
  $color = "text-link-active",
  children,
}: AilaFaqAccordionProps) {
  return (
    <OakAccordion
      id={id}
      header={header}
      $color={$color}
      $ba="border-solid-none"
      $bt={$bt}
      $bb={$bb}
      $borderColor="border-neutral"
      openBackground="bg-primary"
      chevronPosition="right"
      $pa="spacing-0"
      $pv="spacing-16"
      $pb={$pb}
    >
      <OakFlex $mt="spacing-16" $flexDirection="column" $gap="spacing-12">
        {children}
      </OakFlex>
    </OakAccordion>
  );
}

type AilaFaqSectionProps = {
  readonly $color?: AilaFaqAccordionProps["$color"];
};

export function AilaFaqSection({ $color }: AilaFaqSectionProps) {
  return (
    <OakBox>
      <AilaFaqAccordion
        id="create-lesson-whats-included"
        $color={$color}
        header={
          <OakSpan $textAlign="left" $font="body-2-bold">
            What's included?
          </OakSpan>
        }
        $bt="border-solid-s"
        $bb="border-solid-s"
      >
        <OakP $font="body-2">
          Once you've co-created your lesson with Aila, you can download and
          tailor a lesson plan, slide deck, worksheet, prior knowledge starter
          quiz and assessment exit quiz.
        </OakP>
        <OakP $font="body-2">
          Everything is grounded in Oak's{" "}
          <OakLink
            href="https://www.thenational.academy/teachers/curriculum"
            target="_blank"
            rel="noopener noreferrer"
          >
            curriculum expertise
          </OakLink>{" "}
          and national curriculum-aligned resources across key stages 1–4.
        </OakP>
        <OakP $font="body-2">
          Your slide deck is easy to make your own. Add your images, examples
          and classroom context, or apply your school's template once
          downloaded.
        </OakP>
        <OakP $font="body-2">
          Aila currently helps you create individual lessons, not full
          sequences. It also doesn't generate images or web links; we'd rather
          you choose your own.
        </OakP>
      </AilaFaqAccordion>
      <AilaFaqAccordion
        id="create-lesson-aila-different"
        $color={$color}
        header={
          <OakSpan $textAlign="left" $font="body-2-bold">
            How's Aila different from other AI tools?
          </OakSpan>
        }
        $bb="border-solid-s"
      >
        <OakP $font="body-2">
          With a general AI tool, you start from a blank chat box and figure it
          out yourself. Aila gives you a structured, teacher-led process
          instead, grounded in{" "}
          <OakLink
            href="https://www.thenational.academy/teachers/curriculum"
            target="_blank"
            rel="noopener noreferrer"
          >
            our curriculum expertise
          </OakLink>{" "}
          and national curriculum-aligned{" "}
          <OakLink
            href="https://www.thenational.academy/"
            target="_blank"
            rel="noopener noreferrer"
          >
            resources across key stages 1–4
          </OakLink>
          , all ready to tailor to your class and context.
        </OakP>
        <OakP $font="body-2">
          Aila draws on Oak's lessons and resources, so you're building on a
          strong foundation rather than starting from scratch.
        </OakP>
      </AilaFaqAccordion>
      <AilaFaqAccordion
        id="create-lesson-why-trust"
        $color={$color}
        header={
          <OakSpan $textAlign="left" $font="body-2-bold">
            Why trust Aila?
          </OakSpan>
        }
        $pb="spacing-0"
      >
        <OakP $font="body-2">
          Thousands of teachers are using Aila to save up to three hours a week
          on lesson planning.
        </OakP>
        <OakP $font="body-2">
          Aila is built specifically for the classroom. It was made with
          teachers and curriculum specialists and is grounded in Oak's
          curriculum-aligned resources.
        </OakP>
        <OakP $font="body-2">
          You stay in control throughout, working step by step to create your
          lesson. Content is moderated to be{" "}
          <OakLink
            href="https://www.thenational.academy/blog/building-ai-that-s-safe-for-the-classroom-what-we-have-learned-with-aila"
            target="_blank"
            rel="noopener noreferrer"
          >
            safe and appropriate
          </OakLink>{" "}
          for your pupils, and Aila{" "}
          <OakLink
            href="https://www.thenational.academy/blog/choosing-ai-for-your-school-how-our-ai-tools-exceed-the-dfe-latest-safety-standards"
            target="_blank"
            rel="noopener noreferrer"
          >
            meets and exceeds the DfE's AI safety standards
          </OakLink>
          .
        </OakP>
        <OakP $font="body-2">
          AI can make mistakes, so like with any teaching resource, it's worth
          reviewing materials before use. You know your pupils best.
        </OakP>
      </AilaFaqAccordion>
    </OakBox>
  );
}
