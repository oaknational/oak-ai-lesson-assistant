import { prepareAndCheckRestrictions } from "./prepare";
import type * as schemas from "./schemas";
import type { LessonOverviewResponse, TRPCWorksResponse } from "./types";

jest.mock("@oakai/logger", () => ({
  aiLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
  })),
}));

// These tests cover which subjects are checked, not the curriculum schema parsing
jest.mock("./schemas", () => ({
  ...jest.requireActual<typeof schemas>("./schemas"),
  lessonContentSchema: { parse: (lesson: unknown) => lesson },
  lessonBrowseDataByKsSchema: { parse: (browseData: unknown) => browseData },
}));

const lessonSlug = "a-shared-lesson";

const browseDataFor = (subjectSlug: string) => ({
  lesson_slug: lessonSlug,
  unit_slug: `${subjectSlug}-unit`,
  lesson_data: {},
  programme_fields: { subject_slug: subjectSlug },
});

const lessonDataWith = ({
  browseSubjects,
  memberSubjects,
}: {
  browseSubjects: string[];
  memberSubjects?: string[];
}) =>
  ({
    data: {
      content: [
        { lesson_slug: lessonSlug, content_guidance: null, is_legacy: false },
      ],
      browseData: browseSubjects.map(browseDataFor),
      subjectMemberships: memberSubjects?.map((subject_slug) => ({
        subject_slug,
      })),
    },
  }) as unknown as LessonOverviewResponse;

const unrestrictedTcpData = {
  data: {
    tcpWorksByLessonSlug: [],
    restrictionLevels: [
      {
        tpc_works_max_restriction: null,
        tpc_media_max_restriction: null,
        features: {},
      },
    ],
  },
} as TRPCWorksResponse;

describe("prepareAndCheckRestrictions", () => {
  describe("a lesson shared between an allowed and an excluded subject", () => {
    it("is excluded through its programme link, which returns one programme", () => {
      expect(() =>
        prepareAndCheckRestrictions({
          lessonData: lessonDataWith({
            browseSubjects: ["history"],
            memberSubjects: ["history", "geography"],
          }),
          tcpData: unrestrictedTcpData,
          isCanonicalLesson: false,
        }),
      ).toThrow("restricted-subject");
    });

    it("is excluded through its canonical link", () => {
      expect(() =>
        prepareAndCheckRestrictions({
          lessonData: lessonDataWith({
            browseSubjects: ["history", "geography"],
            memberSubjects: ["history", "geography"],
          }),
          tcpData: unrestrictedTcpData,
          isCanonicalLesson: true,
        }),
      ).toThrow("restricted-subject");
    });
  });

  it("allows a lesson only in allowed subjects, keeping its transcript", () => {
    const result = prepareAndCheckRestrictions({
      lessonData: lessonDataWith({
        browseSubjects: ["history"],
        memberSubjects: ["history"],
      }),
      tcpData: unrestrictedTcpData,
      isCanonicalLesson: false,
    });

    expect(result.hasRestrictedTranscript).toBe(false);
  });

  it("excludes a lesson whose subjects are missing", () => {
    expect(() =>
      prepareAndCheckRestrictions({
        lessonData: lessonDataWith({ browseSubjects: ["history"] }),
        tcpData: unrestrictedTcpData,
        isCanonicalLesson: false,
      }),
    ).toThrow("restricted-subject");
  });
});
