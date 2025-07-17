/**
 * @jest-environment jsdom
 */
import { handleDownload } from "../handleDownload";

describe("handleDownload", () => {
  beforeEach(() => {
    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(["test"])),
    });

    // Mock URL.createObjectURL
    global.URL.createObjectURL = jest.fn(() => "blob:test-url");

    // Mock document.createElement and link behavior
    const clickMock = jest.fn();
    const revokeMock = jest.fn();
    document.createElement = jest.fn(() => ({
      click: clickMock,
      set href(val: string) {},
      set download(val: string) {},
    })) as unknown as typeof document.createElement;

    global.URL.revokeObjectURL = revokeMock;
  });

  afterEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it("sets isDownloading and calls fetch", async () => {
    const set = jest.fn();
    const get = jest.fn(() => ({
      docType: "additional-glossary",
      id: "abc",
      pageData: {
        lessonPlan: {
          title: "Lesson",
          lessonId: "id1",
          subject: "s",
          keyStage: "ks",
        },
      },
      generation: {},
      stepNumber: 0,
      isLoadingLessonPlan: false,
      isResourcesLoading: false,
      isResourceRefining: false,
      isDownloading: false,
      formState: {
        subject: null,
        title: null,
        year: null,
        activeDropdown: null,
      },
      moderation: undefined,
      threatDetection: undefined,
      error: null,
      refinementGenerationHistory: [],
      actions: {
        analytics: {
          trackMaterialSelected: jest.fn(),
          trackMaterialRefined: jest.fn(),
          trackMaterialDownloaded: jest.fn(),
        },
      },
      resetToDefault: jest.fn(),
    }));

    // @ts-expect-error Only analytics is mocked, not the full actions
    const handler = handleDownload(set, get);
    await handler();

    expect(set).toHaveBeenCalledWith({ isDownloading: true });
    expect(global.fetch).toHaveBeenCalled();
  });
});
