export type ConsoleCallMatcher =
  | string
  | RegExp
  | readonly unknown[]
  | ((args: unknown[]) => boolean);

export type ConsoleAllowanceOptions = {
  times?: number;
};

export function allowConsoleError(
  matcher?: ConsoleCallMatcher,
  options?: ConsoleAllowanceOptions,
): void;

export function allowConsoleWarn(
  matcher?: ConsoleCallMatcher,
  options?: ConsoleAllowanceOptions,
): void;

export function installConsoleGuard(): void;

export function mockOakLoggerModule(): {
  aiLogger: ((childKey: string) => {
    info: jest.Mock;
    warn: jest.Mock;
    error: jest.Mock;
    table: jest.Mock;
  }) & {
    calls: unknown[][];
    clear: () => void;
    instances: Array<{
      info: jest.Mock;
      warn: jest.Mock;
      error: jest.Mock;
      table: jest.Mock;
    }>;
  };
  structuredLogger: {
    info: jest.Mock;
    warn: jest.Mock;
    error: jest.Mock;
    clear: () => void;
  };
};
