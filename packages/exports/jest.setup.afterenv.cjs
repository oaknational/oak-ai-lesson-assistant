jest.mock("@oakai/logger", () =>
  require("@oakai/test-support").mockOakLoggerModule(),
);
