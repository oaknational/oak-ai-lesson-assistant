require("@testing-library/jest-dom");
require("@oakai/test-support/jest");

jest.mock("@oakai/logger", () =>
  require("@oakai/test-support").mockOakLoggerModule(),
);

process.env.NEXT_PUBLIC_DEBUG = process.env.DEBUG;

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: function MockImage(props) {
    // Imported images are mocked as objects, so only keep string sources
    return require("react").createElement("img", {
      src: typeof props.src === "string" && props.src ? props.src : undefined,
      alt: props.alt,
    });
  },
}));

// Mock Icon component
jest.mock("@/components/Icon", () => ({
  Icon: function MockIcon(props) {
    return require("react").createElement("img", { alt: props.icon });
  },
}));
