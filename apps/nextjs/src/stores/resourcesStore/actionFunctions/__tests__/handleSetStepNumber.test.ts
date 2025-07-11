/**
 * @jest-environment jsdom
 */
import { handleSetStepNumber } from "../handleSetStepNumber";

describe("handleSetStepNumber", () => {
  const baseState = {
    stepNumber: 1,
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
  };

  const validFormState = {
    subject: "math",
    year: "2025",
    title: null,
    activeDropdown: null,
  };

  const createMockGet = (overrides = {}) => {
    return jest.fn(() => ({
      ...baseState,
      formState: validFormState,
      id: "abc",
      actions: { analytics: { trackMaterialRefined: jest.fn() } },
      ...overrides,
    }));
  };

  beforeEach(() => {
    jest.spyOn(window, "scrollTo").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("sets stepNumber and logs info", () => {
    const set = jest.fn();
    const get = createMockGet();
    // @ts-expect-error Only analytics is mocked, not the full actions shape
    const handler = handleSetStepNumber(set, get);

    handler(2);

    expect(set).toHaveBeenCalledWith({ stepNumber: 2 });
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
  });

  it("calls analytics when componentType is continue_button and formState/ID present", () => {
    const analytics = { trackMaterialRefined: jest.fn() };
    const set = jest.fn();
    const get = createMockGet({ actions: { analytics } });
    // @ts-expect-error Only analytics is mocked, not the full actions shape
    const handler = handleSetStepNumber(set, get);

    handler(3, "continue_button");

    expect(analytics.trackMaterialRefined).toHaveBeenCalledWith(
      "continue_button",
    );
    expect(set).toHaveBeenCalledWith({ stepNumber: 3 });
  });

  it("calls analytics when componentType is back_a_step_button and formState/ID present", () => {
    const analytics = { trackMaterialRefined: jest.fn() };
    const set = jest.fn();
    const get = createMockGet({
      stepNumber: 3,
      actions: { analytics },
    });
    // @ts-expect-error Only analytics is mocked, not the full actions shape
    const handler = handleSetStepNumber(set, get);

    handler(2, "back_a_step_button");

    expect(analytics.trackMaterialRefined).toHaveBeenCalledWith(
      "back_a_step_button",
    );
    expect(set).toHaveBeenCalledWith({ stepNumber: 2 });
  });

  it("scrolls to top when setting step number", () => {
    const set = jest.fn();
    const get = createMockGet();
    // @ts-expect-error Only analytics is mocked, not the full actions shape
    const handler = handleSetStepNumber(set, get);

    handler(5);

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
    expect(set).toHaveBeenCalledWith({ stepNumber: 5 });
  });

  it("handles multiple missing conditions for analytics", () => {
    const analytics = { trackMaterialRefined: jest.fn() };
    const set = jest.fn();
    const get = createMockGet({
      formState: { ...validFormState, subject: null, year: null },
      id: null,
      actions: { analytics },
    });
    // @ts-expect-error Only analytics is mocked, not the full actions shape
    const handler = handleSetStepNumber(set, get);

    handler(2, "continue_button");

    expect(analytics.trackMaterialRefined).not.toHaveBeenCalled();
    expect(set).toHaveBeenCalledWith({ stepNumber: 2 });
  });
});
