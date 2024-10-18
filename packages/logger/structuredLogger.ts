import pino from "pino";

const logger = pino({
  level: process.env.NEXT_PUBLIC_PINO_LOG_LEVEL || "info",
  browser: {
    write(obj) {
      const msg = "msg" in obj && obj.msg;
      console.warn(
        `Invalid use of @oakai/logger, use logger/browser, logMessage=${msg}`,
      );
    },
  },
  formatters: {
    // Pino logs the level as a syslog number, so make sure
    // it sends error/warn/info etc instead
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  // Pino's default key of `time` is ignored by datadog, so explicitly set
  // `timestamp`
  timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
});

export type StructuredLogger = typeof logger;

export default logger;
