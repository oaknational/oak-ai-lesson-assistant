/* eslint-env browser */
import pino from "pino";

/**
 * Browser / middleware edge context logger
 *
 * Attempting to call the main logger from the middleware
 * context will result in malformed logs
 */

const logLevels = {
  10: { name: "TRACE" },
  20: { name: "DEBUG" },
  30: { name: "INFO" },
  40: { name: "WARN" },
  50: { name: "ERROR" },
  60: { name: "FATAL" },
};

function format(obj: Record<string, unknown>) {
  if ("level" in obj) {
    obj.level = logLevels[obj.level as keyof typeof logLevels]?.name;
  }

  if ("time" in obj) {
    obj.timestamp = obj.time;
    delete obj.time;
  }

  return obj;
}

function serialize(obj: Record<string, unknown>) {
  try {
    return JSON.stringify(obj);
  } catch (err) {
    if (err instanceof Error) {
      // Without a `replacer` argument, stringify on Error results in `{}`
      return JSON.stringify(err, ["name", "message", "stack"]);
    }
    return JSON.stringify({ level: "error", message: "Unknown error type" });
  }
}

function consoleWriter(level: "debug" | "info" | "warn" | "error") {
  return function (obj: object) {
    // Pino types say object, but we can treat it as a record
    const formatted = format(obj as Record<string, unknown>);

    if (typeof window !== "undefined") {
      if (formatted.msg) {
        console[level](formatted.msg, formatted);
      } else {
        console[level](formatted);
      }
    } else {
      // JSON encode middleware logs
      console.log(serialize(formatted));
    }
  };
}

/**
 * Allow overriding the log level via either
 * - setting ?logLevel=x
 * - NEXT_PUBLIC_PINO_BROWSER_LOG_LEVEL=x
 */
const searchParamLogLevel =
  typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("logLevel")
    : null;
// const logLevel =
//   searchParamLogLevel ??
//   process.env.NEXT_PUBLIC_PINO_BROWSER_LOG_LEVEL ??
//   "info";
const logLevel = "debug";

const browserLogger = pino({
  level: logLevel,
  browser: {
    serialize: true,
    write: {
      debug: consoleWriter("debug"),
      info: consoleWriter("info"),
      warn: consoleWriter("warn"),
      error: consoleWriter("error"),
    },
  },
});

export type BrowserLogger = typeof browserLogger;

export default browserLogger;
