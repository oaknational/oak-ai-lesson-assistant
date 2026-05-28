import type { AilaServices } from "../AilaServices";
import type { Message } from "../chat";
import { AilaDocument } from "./AilaDocument";

describe("AilaDocument", () => {
  describe("initialiseContentFromMessages", () => {
    it("does not fail chat initialisation when categorisation fails", async () => {
      const error = new Error("provider 500");
      const reportError = jest.fn();
      const categoriser = {
        categorise: jest.fn().mockRejectedValue(error),
      };
      const document = new AilaDocument({
        aila: {
          errorReporter: { reportError },
        } as unknown as AilaServices,
        content: {},
        categoriser,
      });
      const messages: Message[] = [
        {
          id: "message-id",
          role: "user",
          content: "Plan a lesson on plate tectonics",
        },
      ];

      await expect(
        document.initialiseContentFromMessages(messages),
      ).resolves.toBeUndefined();

      expect(document.content).toEqual({});
      expect(document.hasInitialisedContentFromMessages).toBe(false);
      expect(reportError).toHaveBeenCalledWith(
        error,
        "Failed to initialise content from messages",
        "warning",
      );
    });
  });
});
