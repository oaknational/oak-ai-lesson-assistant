import { handleSetStepNumber } from "../handleSetStepNumber";

describe("handleSetStepNumber", () => {
  it("sets stepNumber and logs info", () => {
    const set = jest.fn();
    const get = jest.fn(() => ({
      stepNumber: 1,
      formState: {
        subject: "math",
        year: "2025",
        title: null,
        activeDropdown: null,
      },
      id: "abc",
      actions: { analytics: { trackMaterialRefined: jest.fn() } },
      isLoadingLessonPlan: false,
      isResourcesLoading: false,
      isResourceRefining: false,
      isDownloading: false,
      pageData: {
        lessonPlan: { lessonId: "id1", title: "", subject: "", keyStage: "" },
      },
      generation: null,
      docType: null,
      moderation: undefined,
      threatDetection: undefined,
      error: null,
      refinementGenerationHistory: [],
      resetToDefault: jest.fn(),
    }));
    // @ts-expect-error Only analytics is mocked, not the full actions shape
    const handler = handleSetStepNumber(set, get);
    handler(2);
    expect(set).toHaveBeenCalledWith({ stepNumber: 2 });
  });

  it("calls analytics when componentType is continue_button and formState/ID present", () => {
    const analytics = { trackMaterialRefined: jest.fn() };
    const set = jest.fn();
    const get = jest.fn(() => ({
      stepNumber: 1,
      formState: {
        subject: "math",
        year: "2025",
        title: null,
        activeDropdown: null,
      },
      id: "abc",
      actions: { analytics },
      isLoadingLessonPlan: false,
      isResourcesLoading: false,
      isResourceRefining: false,
      isDownloading: false,
      pageData: {
        lessonPlan: { lessonId: "id1", title: "", subject: "", keyStage: "" },
      },
      generation: null,
      docType: null,
      moderation: undefined,
      threatDetection: undefined,
      error: null,
      refinementGenerationHistory: [],
      resetToDefault: jest.fn(),
    }));
    // @ts-expect-error Only analytics is mocked, not the full actions shape
    const handler = handleSetStepNumber(set, get);
    handler(3, "continue_button");
    expect(analytics.trackMaterialRefined).toHaveBeenCalledWith(
      "continue_button",
    );
    expect(set).toHaveBeenCalledWith({ stepNumber: 3 });
  });
});
