import { useState } from "react";

import type {
  LessonPlanKey,
  LessonPlanSectionWhileStreaming,
  LooseLessonPlan,
} from "@oakai/aila/src/protocol/schema";
import { sectionToMarkdown } from "@oakai/aila/src/protocol/sectionToMarkdown";
import type { ImageCycle } from "@oakai/api/src/router/imageGen";
import {
  OakFlex,
  OakP,
  OakSmallPrimaryButton,
} from "@oaknational/oak-components";
import Image from "next/image";

import useGetImages from "@/app/images/hooks/useGetImages";
import { useLessonChat } from "@/components/ContextProviders/ChatProvider";
import { lessonSectionTitlesAndMiniDescriptions } from "@/data/lessonSectionTitlesAndMiniDescriptions";

import { sectionTitle } from ".";
import { MemoizedReactMarkdownWithStyles } from "../markdown";
import AddAdditionalMaterialsButton from "./add-additional-materials-button";
import FlagButton from "./flag-button";
import ModifyButton from "./modify-button";

export type ChatSectionProps = Readonly<{
  section: LessonPlanKey;
  value: LessonPlanSectionWhileStreaming;
}>;

const ChatSection = ({ section, value }: ChatSectionProps) => {
  return (
    <OakFlex $flexDirection="column">
      {section === "cycle1" || section === "cycle2" || section === "cycle3" ? (
        <div className="grid grid-cols-3">
          <div className="col-span-2">
            <MemoizedReactMarkdownWithStyles
              lessonPlanSectionDescription={
                lessonSectionTitlesAndMiniDescriptions[section]?.description
              }
              markdown={`${sectionToMarkdown(section, value)}`}
            />
          </div>
          <ImageComponent
            cycleNumber={Number(section.split("cycle")[1]) as 1 | 2 | 3}
            cycle={value as ImageCycle}
          />
        </div>
      ) : (
        <MemoizedReactMarkdownWithStyles
          lessonPlanSectionDescription={
            lessonSectionTitlesAndMiniDescriptions[section]?.description
          }
          markdown={`${sectionToMarkdown(section, value)}`}
        />
      )}

      <OakFlex
        $gap="all-spacing-3"
        $mt="space-between-s"
        $position="relative"
        $display={["none", "flex"]}
      >
        {section === "additionalMaterials" && value === "None" ? (
          <AddAdditionalMaterialsButton
            sectionTitle={sectionTitle(section)}
            sectionPath={section}
            sectionValue={value}
          />
        ) : (
          <ModifyButton
            sectionTitle={sectionTitle(section)}
            sectionPath={section}
            sectionValue={value}
          />
        )}

        <FlagButton
          sectionTitle={sectionTitle(section)}
          sectionPath={section}
          sectionValue={value}
        />
      </OakFlex>
    </OakFlex>
  );
};

export default ChatSection;

const ImageComponent = ({
  cycleNumber,
  cycle,
}: {
  cycleNumber: 1 | 2 | 3;
  cycle: ImageCycle;
}) => {
  const { chat } = useLessonChat();

  const pageData = {
    id: chat?.id,
    path: chat?.path,
    title: chat?.lessonPlan.title,
    subject: chat?.lessonPlan.subject,
    keyStage: chat?.lessonPlan.keyStage,
    lessonPlan: chat?.lessonPlan as LooseLessonPlan,
  };

  const {
    newImagePrompt,
    newPromptLoading,
    cycleImagesFromAilaPrompt,
    cycleImagesFromAilaPromptLoading,
    cycleImagesFromAgentPrompt,
    cycleImagesFromAgentPromptLoading,
    allAilaPromptImagesSortedByRelavanceScore,
    allAgentPromptImagesSortedByRelavanceScore,
    handleGeneratePrompt,
    generateImagesFromAilaPrompt,
    generateImagesFromAgentPrompt,
  } = useGetImages({
    cycleNumber,
    cycle,
    pageData,
  });

  return (
    <div className="flex flex-col space-y-5 rounded-sm bg-slate-200 p-6">
      <div className="mb-10">
        <OakP>Images:</OakP>
      </div>
      {newImagePrompt ? (
        <ImagePrompt newImagePrompt={newImagePrompt} />
      ) : (
        <>
          <OakSmallPrimaryButton
            onClick={() => {
              handleGeneratePrompt().catch(console.error);
            }}
          >
            Load image prompts
          </OakSmallPrimaryButton>
          {newPromptLoading && <OakP>Loading image prompts...</OakP>}
        </>
      )}
      {newImagePrompt && (
        <div className="flex flex-col space-y-5">
          <OakSmallPrimaryButton
            onClick={() => {
              generateImagesFromAgentPrompt().catch(console.error);
            }}
          >
            Load images
          </OakSmallPrimaryButton>
          {cycleImagesFromAgentPromptLoading && <OakP>Loading images...</OakP>}

          <Images cycleImages={allAgentPromptImagesSortedByRelavanceScore} />
        </div>
      )}
    </div>
  );
};

const Images = ({ cycleImages }) => {
  const imagesWithAScoreOfMoreThan5 = cycleImages.filter(
    (image) => image.appropriatenessScore > 5,
  );
  const imagesWithAScoreOfLessThan5 = cycleImages.filter(
    (image) => image.appropriatenessScore <= 5,
  );
  const [showPoorImages, setShowPoorImages] = useState(false);

  return (
    <div className="flex flex-col space-y-5">
      {imagesWithAScoreOfMoreThan5.map((image) => (
        <Image src={image.url} width={300} height={300} alt="" />
      ))}
      {imagesWithAScoreOfLessThan5.length > 0 && (
        <button className="text-left">
          <OakP
            $font="body-3"
            onClick={() => {
              setShowPoorImages(!showPoorImages);
            }}
          >
            {showPoorImages ? "Hide" : "Show"} poor images
          </OakP>
        </button>
      )}
      {showPoorImages &&
        imagesWithAScoreOfLessThan5.map((image) => (
          <Image src={image.url} width={300} height={300} alt="" />
        ))}
    </div>
  );
};

const ImagePrompt = ({ newImagePrompt }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  return (
    <>
      <OakP $font="body-2">Image prompt Loaded ✅</OakP>
      <button className="text-left">
        <OakP
          $font="body-3"
          onClick={() => {
            setShowPrompt(!showPrompt);
          }}
        >
          {showPrompt ? "Hide" : "Show"} prompt
        </OakP>
      </button>
      {showPrompt && (
        <div>
          <OakP $font="body-2">{newImagePrompt}</OakP>
        </div>
      )}
    </>
  );
};
