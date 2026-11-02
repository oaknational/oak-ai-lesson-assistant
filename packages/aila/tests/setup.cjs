require("@oakai/test-support/jest");

jest.mock("@oakai/logger", () =>
  require("@oakai/test-support").mockOakLoggerModule(),
);
