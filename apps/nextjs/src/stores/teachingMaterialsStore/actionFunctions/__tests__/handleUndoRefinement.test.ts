import type { AdditionalMaterialType } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";

import { handleUndoRefinement } from "../handleUndoRefinement";

describe("handleUndoRefinement", () => {
  const validDocType: AdditionalMaterialType = "additional-comprehension";

  it("does nothing if no history", () => {
    const set = jest.fn();
    // Use a valid TeachingMaterialsState shape for get
    const get = jest.fn(() => ({
      refinementGenerationHistory: [],
      formState: {
        subject: "math",
        year: "2025",
        title: null,
        activeDropdown: null,
      },
      pageData: {
        lessonPlan: {
          title: "Lesson",
          lessonId: "id1",
          subject: "s",
          keyStage: "ks",
        },
      },
      docType: validDocType,
      id: "abc",
      actions: { analytics: { trackMaterialRefined: jest.fn() } },
      stepNumber: 0,
      isLoadingLessonPlan: false,
      isResourcesLoading: false,
      isResourceRefining: false,
      isDownloading: false,
      moderation: undefined,
      threatDetection: undefined,
      error: null,
      generation: null,
      resetToDefault: jest.fn(),
    }));
    // @ts-expect-error Only analytics is mocked, not the full actions shape
    const handler = handleUndoRefinement(set, get);
    handler();
    expect(set).not.toHaveBeenCalled();
  });

  it("undoes refinement and tracks analytics", () => {
    const analytics = { trackMaterialRefined: jest.fn() };
    const set = jest.fn();
    const get = jest.fn(() => ({
      refinementGenerationHistory: ["gen1", "gen2"],
      formState: {
        subject: "math",
        year: "2025",
        title: null,
        activeDropdown: null,
      },
      pageData: {
        lessonPlan: {
          title: "Lesson",
          lessonId: "id1",
          subject: "s",
          keyStage: "ks",
        },
      },
      docType: validDocType,
      id: "abc",
      actions: { analytics },
      stepNumber: 0,
      isLoadingLessonPlan: false,
      isResourcesLoading: false,
      isResourceRefining: false,
      isDownloading: false,
      moderation: undefined,
      threatDetection: undefined,
      error: null,
      generation: null,
      resetToDefault: jest.fn(),
    }));
    // @ts-expect-error Only analytics is mocked, not the full actions shape
    const handler = handleUndoRefinement(set, get);
    handler();
    expect(set).toHaveBeenCalledWith({
      generation: "gen2",
      refinementGenerationHistory: ["gen1"],
    });
    expect(analytics.trackMaterialRefined).toHaveBeenCalledWith("undo_button");
  });
});
