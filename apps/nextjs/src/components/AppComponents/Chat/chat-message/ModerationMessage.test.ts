import type { MessagePart } from "@oakai/aila/src/protocol/jsonPatchProtocol";
import type {
  ModerationResult,
  PersistedModerationBase,
} from "@oakai/core/src/utils/ailaModeration/moderationSchema";

import type { ParsedMessage } from "@/stores/chatStore/types";

import { getModerationsToDisplay } from "./ModerationMessage";

type ModerationCategory = ModerationResult["categories"][number];

const textPart: MessagePart = {
  type: "message-part",
  id: "text-part",
  isPartial: false,
  document: {
    type: "text",
    value: "Message content",
  },
};

function message(id: string, parts: MessagePart[] = [textPart]): ParsedMessage {
  return {
    id,
    role: "assistant",
    content: "",
    parts,
    hasError: false,
    isEditing: false,
  };
}

function moderation(
  id: string,
  messageId: string,
  categories: ModerationCategory[],
): PersistedModerationBase {
  return {
    id,
    messageId,
    categories,
  };
}

function embeddedModerationPart(
  id: string,
  categories: ModerationCategory[],
): MessagePart {
  return {
    type: "message-part",
    id: `${id}-part`,
    isPartial: false,
    document: {
      type: "moderation",
      id,
      categories,
    },
  };
}

describe("getModerationsToDisplay", () => {
  test("does not display safe moderations", () => {
    const messages = [message("m1")];
    const moderations = [moderation("safe", "m1", [])];

    expect(getModerationsToDisplay(messages, moderations).size).toBe(0);
  });

  test("displays the first non-safe moderation", () => {
    const messages = [message("m1")];
    const moderations = [moderation("mod-1", "m1", ["p/external-content"])];

    expect(getModerationsToDisplay(messages, moderations).get("m1")?.id).toBe(
      "mod-1",
    );
  });

  test("suppresses repeated identical category sets", () => {
    const messages = [message("m1"), message("m2"), message("m3")];
    const moderations = [
      moderation("mod-1", "m1", ["p/external-content", "l/strong-language"]),
      moderation("mod-2", "m2", ["l/strong-language", "p/external-content"]),
      moderation("mod-3", "m3", ["l/strong-language"]),
    ];

    const displayed = getModerationsToDisplay(messages, moderations);

    expect([...displayed.keys()]).toEqual(["m1", "m3"]);
  });

  test("displays additions, removals, and changed category sets", () => {
    const messages = [
      message("m1"),
      message("m2"),
      message("m3"),
      message("m4"),
    ];
    const moderations = [
      moderation("mod-1", "m1", ["p/external-content"]),
      moderation("mod-2", "m2", ["p/external-content", "l/strong-language"]),
      moderation("mod-3", "m3", ["p/external-content"]),
      moderation("mod-4", "m4", ["l/strong-language"]),
    ];

    const displayed = getModerationsToDisplay(messages, moderations);

    expect([...displayed.keys()]).toEqual(["m1", "m2", "m3", "m4"]);
  });

  test("displays a repeated category set after a safe moderation", () => {
    const messages = [message("m1"), message("m2"), message("m3")];
    const moderations = [
      moderation("mod-1", "m1", ["p/external-content"]),
      moderation("mod-2", "m2", []),
      moderation("mod-3", "m3", ["p/external-content"]),
    ];

    const displayed = getModerationsToDisplay(messages, moderations);

    expect([...displayed.keys()]).toEqual(["m1", "m3"]);
  });

  test("uses embedded moderation parts when persisted moderation is unavailable", () => {
    const messages = [
      message("m1", [
        textPart,
        embeddedModerationPart("embedded-1", ["p/external-content"]),
      ]),
    ];

    expect(getModerationsToDisplay(messages, []).get("m1")?.id).toBe(
      "embedded-1",
    );
  });

  test("prefers persisted moderation over embedded moderation parts", () => {
    const messages = [
      message("m1", [
        textPart,
        embeddedModerationPart("embedded-1", ["p/external-content"]),
      ]),
    ];
    const persistedModeration = moderation("persisted-1", "m1", [
      "l/strong-language",
    ]);

    expect(
      getModerationsToDisplay(messages, [persistedModeration]).get("m1"),
    ).toEqual(persistedModeration);
  });
});
