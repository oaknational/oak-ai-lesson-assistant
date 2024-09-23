import { getLastAssistantMessage } from "@oakai/aila/src/helpers/chat/getLastAssistantMessage";
import { AilaPersistedChat } from "@oakai/aila/src/protocol/schema";

import { useProgressForDownloads } from "@/components/AppComponents/Chat/Chat/hooks/useProgressForDownloads";
import { ExportsHookProps } from "@/components/ExportsDialogs/exports.types";
import { useExportAdditionalMaterials } from "@/components/ExportsDialogs/useExportAdditionalMaterials";
import { useExportLessonPlanDoc } from "@/components/ExportsDialogs/useExportLessonPlanDoc";
import { useExportLessonSlides } from "@/components/ExportsDialogs/useExportLessonSlides";
import { useExportQuizDoc } from "@/components/ExportsDialogs/useExportQuizDoc";
import { useExportWorksheetSlides } from "@/components/ExportsDialogs/useExportWorksheetSlides";

export function useDownloadView({
  id,
  lessonPlan,
  messages,
}: AilaPersistedChat) {
  const exportProps: ExportsHookProps = {
    onStart: () => null,
    lesson: lessonPlan,
    chatId: id,
    messageId: getLastAssistantMessage(messages)?.id,
    active: true,
  };

  const lessonSlidesExport = useExportLessonSlides(exportProps);

  const worksheetExport = useExportWorksheetSlides(exportProps);

  const lessonPlanExport = useExportLessonPlanDoc(exportProps);

  const starterQuizExport = useExportQuizDoc({
    ...exportProps,
    quizType: "starter",
  });

  const exitQuizExport = useExportQuizDoc({
    ...exportProps,
    quizType: "exit",
  });

  const additionalMaterialsExport = useExportAdditionalMaterials(exportProps);

  const { sections, totalSections, totalSectionsComplete } =
    useProgressForDownloads({ lessonPlan, isStreaming: false });

  return {
    lessonSlidesExport,
    worksheetExport,
    lessonPlanExport,
    starterQuizExport,
    exitQuizExport,
    additionalMaterialsExport,
    sections,
    totalSections,
    totalSectionsComplete,
  };
}
