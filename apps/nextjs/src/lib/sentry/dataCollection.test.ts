import * as Sentry from "@sentry/nextjs";
import { execFileSync } from "node:child_process";
import path from "node:path";

import { sentryDataCollection } from "./dataCollection";

jest.mock("@sentry/nextjs", () => ({
  init: jest.fn(),
  replayIntegration: () => ({ name: "Replay" }),
}));

describe("Sentry privacy", () => {
  it.each(["client", "server", "edge"])(
    "applies the shared collection policy in the %s runtime",
    (runtime) => {
      // Exercise the actual entry points so accidentally omitting the policy
      // from one runtime is caught as well as changes to the policy itself.
      jest.requireActual(`../../../sentry.${runtime}.config.ts`);
      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({ dataCollection: sentryDataCollection }),
      );
      if (runtime === "client") {
        expect(Sentry.init).toHaveBeenCalledWith(
          expect.objectContaining({
            replaysOnErrorSampleRate: 0,
            replaysSessionSampleRate: 0,
          }),
        );
      }
    },
  );

  it("filters private data from real SDK events and AI traces", () => {
    // A separate Node process exercises native diagnostics channels and the
    // real SDK, without Jest's module transforms or global Sentry state.
    const output = execFileSync(
      process.execPath,
      [
        "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", // cspell:ignore TYPELESS
        path.join(__dirname, "__fixtures__/privacyProbe.mjs"),
      ],
      { encoding: "utf8", timeout: 15_000 },
    );
    expect(JSON.parse(output)).toEqual({
      errorCaptured: true,
      aiSpansCaptured: true,
      nativeOpenAiSpanCaptured: true,
      privateDataCaptured: false,
    });
  });
});
