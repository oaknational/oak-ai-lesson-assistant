"use client";

import React, { useEffect, useMemo } from "react";

import { SerializedAppWithPrompt } from "@oakai/core/src/models/serializers";
import {
  OakBox,
  OakHeading,
  OakLI,
  OakMaxWidth,
  OakP,
  OakSpan,
  OakUL,
} from "@oaknational/oak-components";
import { usePathname } from "next/navigation";

import HeroContainer from "@/components/HeroContainer";
import Layout from "@/components/Layout";
import { slugify } from "@/utils/slugify";

type PromptsPageData = {
  apps: SerializedAppWithPrompt[];
  featureFlag: boolean;
};

const Prompts = ({ apps, featureFlag }: PromptsPageData) => {
  const pathname = usePathname();
  const itemRefs: { [key: string]: React.RefObject<HTMLLIElement> } = useMemo(
    () => ({}),
    [],
  );

  const marginOffset = 40;
  useEffect(() => {
    const hash = (pathname ?? "").split("#")[1];
    if (hash) {
      const targetElement = itemRefs[hash]?.current;
      if (targetElement) {
        const offsetTop = targetElement.offsetTop - marginOffset;
        window.scrollTo({ top: offsetTop, behavior: "smooth" });
        const h3Element = targetElement.querySelector("h3");
        targetElement.classList.add("ml-10");
        if (h3Element) {
          h3Element.classList.add("bg-lemon");
          h3Element.classList.add("pl-4");
        }
      }
    }
  }, [pathname, itemRefs]);

  return (
    <Layout featureFlag={featureFlag}>
      <OakMaxWidth>
        <HeroContainer>
          <OakBox>
            <OakHeading tag="h1" $mb="space-between-s" $font="heading-2">
              How does our AI work?
            </OakHeading>
            <OakP>
              At Oak&apo;s AI Experiments, we aim to test whether high quality
              education content can be generated using existing Large Language
              Models (LLMs). We are keen to make sure that our work is
              transparent. All our code across Oak is open source, and the repo
              for our AI tools can be found{" "}
              <a
                href="https://github.com/oaknational/oak-ai-lesson-assistant/tree/main/packages/aila/src/core/prompt"
                target="_blank"
              >
                here
              </a>
              .
            </OakP>
          </OakBox>
        </HeroContainer>
        <OakBox $pv="inner-padding-s" $mt="space-between-xl">
          <OakHeading $mb="space-between-s" tag="h2">
            As an example, here is the prompt that we use for our quiz builder
            tool:
          </OakHeading>

          <OakUL>
            {apps.map((app) => {
              if (app.name !== "Lesson planner") {
                return (
                  <OakLI
                    key={app.id}
                    className="border-b border-black border-opacity-30 pb-14"
                  >
                    <OakHeading
                      tag="h3"
                      $font="body-1-bold"
                      $mb="space-between-ssx"
                      $mt="space-between-m"
                    >
                      <OakSpan $font="body-1">App:</OakSpan> {app.name}
                    </OakHeading>
                    <OakUL>
                      {app.prompts.map((prompt) => {
                        const promptRef = React.createRef<HTMLLIElement>();
                        itemRefs[slugify(prompt.name)] = promptRef;

                        return (
                          <OakLI
                            key={prompt.id}
                            className="mt-20 delay-500 duration-500"
                            id={slugify(prompt.name)}
                            ref={promptRef}
                          >
                            <OakHeading
                              tag="h3"
                              $font="heading-6"
                              $mb="space-between-ssx"
                            >
                              {prompt.name}
                            </OakHeading>
                            <OakP className="font-mono text-sm font-bold">
                              Prompt:
                              <br />
                            </OakP>
                            <pre className="max-w-full whitespace-pre-wrap break-words">
                              {prompt.template}
                            </pre>
                          </OakLI>
                        );
                      })}
                    </OakUL>
                  </OakLI>
                );
              }
            })}
          </OakUL>
        </OakBox>
      </OakMaxWidth>
    </Layout>
  );
};

export default Prompts;
