const { installConsoleGuard } = require("./index.cjs");

installConsoleGuard();

jest.mock("@oakai/logger", () => require("./index.cjs").mockOakLoggerModule());
