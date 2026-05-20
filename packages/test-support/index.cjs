const util = require("node:util");

const state = {
  installed: false,
  guards: {},
  allowances: {
    error: [],
    warn: [],
  },
  unexpected: {
    error: [],
    warn: [],
  },
};

function getJest() {
  if (global.jest) {
    return global.jest;
  }

  return require("@jest/globals").jest;
}

function formatArgs(args) {
  return args
    .map((arg) =>
      typeof arg === "string"
        ? arg
        : util.inspect(arg, { depth: 6, breakLength: 120 }),
    )
    .join(" ");
}

function matcherName(matcher) {
  if (typeof matcher === "string") return `"${matcher}"`;
  if (matcher instanceof RegExp) return matcher.toString();
  if (Array.isArray(matcher)) return `[${matcher.map(matcherName).join(", ")}]`;
  if (typeof matcher === "function") return matcher.name || "custom matcher";
  return util.inspect(matcher, { depth: 3 });
}

function valueMatches(expected, actual) {
  if (typeof expected === "string") {
    return String(actual).includes(expected);
  }

  if (expected instanceof RegExp) {
    return expected.test(String(actual));
  }

  if (typeof expected === "function") {
    return Boolean(expected(actual));
  }

  return Object.is(expected, actual);
}

function callMatches(matcher, args) {
  if (matcher === undefined) return true;

  if (typeof matcher === "function") {
    return Boolean(matcher(args));
  }

  if (typeof matcher === "string" || matcher instanceof RegExp) {
    return valueMatches(matcher, formatArgs(args));
  }

  if (Array.isArray(matcher)) {
    return matcher.every((expected, index) =>
      valueMatches(expected, args[index]),
    );
  }

  return false;
}

function addAllowance(method, matcher, options = {}) {
  state.allowances[method].push({
    matcher,
    remaining: options.times ?? 1,
  });
}

function allowConsoleError(matcher, options) {
  addAllowance("error", matcher, options);
}

function allowConsoleWarn(matcher, options) {
  addAllowance("warn", matcher, options);
}

function recordCall(method, args) {
  const allowance = state.allowances[method].find(
    (entry) => entry.remaining > 0 && callMatches(entry.matcher, args),
  );

  if (allowance) {
    allowance.remaining -= 1;
    return;
  }

  state.unexpected[method].push(args);
}

function installGuard(method) {
  const jestGlobal = getJest();

  state.guards[method] ??= jestGlobal.spyOn(console, method);
  state.guards[method].mockImplementation((...args) => {
    recordCall(method, args);
  });
}

function resetState() {
  state.allowances.error = [];
  state.allowances.warn = [];
  state.unexpected.error = [];
  state.unexpected.warn = [];
}

function assertNoConsoleIssues() {
  const messages = [];

  for (const method of ["error", "warn"]) {
    for (const args of state.unexpected[method]) {
      messages.push(
        `Unexpected console.${method} — if this is expected in this test, declare it before the code that triggers it:\n` +
          `\n` +
          `  allow${method === "error" ? "ConsoleError" : "ConsoleWarn"}(${JSON.stringify(formatArgs(args))});\n` +
          `\n` +
          `Import from '@oakai/test-support'. Use a RegExp or substring to match loosely.\n` +
          `Received: ${formatArgs(args)}`,
      );
    }

    for (const allowance of state.allowances[method]) {
      if (allowance.remaining > 0) {
        messages.push(
          `allow${method === "error" ? "ConsoleError" : "ConsoleWarn"}(${matcherName(allowance.matcher)}) was declared but console.${method} was never called with a matching message.\n` +
            `Remove the allowance, or check whether the code still logs this ${method}.`,
        );
      }
    }
  }

  if (messages.length > 0) {
    throw new Error(messages.join("\n\n"));
  }
}

function installConsoleGuard() {
  if (state.installed) return;

  installGuard("error");
  installGuard("warn");

  beforeEach(() => {
    resetState();
    installGuard("error");
    installGuard("warn");
  });

  afterEach(() => {
    try {
      assertNoConsoleIssues();
    } finally {
      state.guards.error?.mockClear?.();
      state.guards.warn?.mockClear?.();
      resetState();
    }
  });

  afterAll(() => {
    state.guards.error?.mockRestore?.();
    state.guards.warn?.mockRestore?.();
    state.guards.error = undefined;
    state.guards.warn = undefined;
    state.installed = false;
  });

  state.installed = true;
}

function mockOakLoggerModule() {
  const jestGlobal = getJest();
  const createLogger = () => ({
    info: jestGlobal.fn(),
    warn: jestGlobal.fn(),
    error: jestGlobal.fn(),
    table: jestGlobal.fn(),
  });
  const loggerCalls = [];
  const loggerInstances = [];
  const structuredLogger = {
    info: jestGlobal.fn(),
    warn: jestGlobal.fn(),
    error: jestGlobal.fn(),
  };
  const aiLogger = (...args) => {
    loggerCalls.push(args);
    const logger = createLogger();
    loggerInstances.push(logger);
    return logger;
  };
  aiLogger.calls = loggerCalls;
  aiLogger.instances = loggerInstances;
  aiLogger.clear = () => {
    loggerCalls.length = 0;
    loggerInstances.length = 0;
  };
  structuredLogger.clear = () => {
    structuredLogger.info.mockClear();
    structuredLogger.warn.mockClear();
    structuredLogger.error.mockClear();
  };

  return {
    aiLogger,
    structuredLogger,
  };
}

module.exports = {
  allowConsoleError,
  allowConsoleWarn,
  installConsoleGuard,
  mockOakLoggerModule,
};
