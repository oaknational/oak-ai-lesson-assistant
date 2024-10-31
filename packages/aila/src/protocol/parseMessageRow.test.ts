import invariant from "tiny-invariant";

import { PatchCycle, parseMessageRow } from "./jsonPatchProtocol";
import type { Cycle } from "./schema";

/* 

Our Zod schema for valid message parts can be too relaxed, so this tests that we get back
what we expect when parsing a message row.
If you do [SomeZodSchema].safeParse it would return data = {} instead of data = {a validated cycle}.

This is unexpected behaviour and would lead to sections appearing to be blank even 
though the client has received data. If there's just a small error in the schema, it would
result in no validation error, and an empty object being returned. 
There is a comment on the relevant type that was causing the problem, which is unresolved.
*/
describe("parseMessageRow", () => {
  it("should correctly parse a patch message with cycle3 data", () => {
    const cycle: Cycle = {
      checkForUnderstanding: [
        { question: "Q1", answers: ["1"], distractors: ["1", "2", "3"] },
        { question: "Q2", answers: ["1"], distractors: ["1", "2", "3"] },
      ],
      durationInMinutes: 15,
      explanation: {
        spokenExplanation: ["item1", "item2", "item3", "item4", "item5"],
        accompanyingSlideDetails:
          "Diagram comparing Roman and Anglo-Saxon societies.",
        imagePrompt: "Roman vs Anglo-Saxon Britain",
        slideText:
          "Roman withdrawal led to cultural blending and societal transformation.",
      },
      feedback:
        "Model answer: The long-term impacts included cultural blending, economic disruptions, rise of feudalism, and lasting Roman legal influences.",
      practice:
        "Evaluate the long-term impacts of Roman withdrawal on British society, considering cultural, economic, and political changes.",
      title: "Long-term Impacts of Roman Withdrawal",
    };

    const cyclePatch = {
      type: "patch",
      reasoning:
        "The third learning cycle evaluates the long-term impacts of Roman withdrawal on British society, emphasizing cultural and societal changes.",
      value: {
        op: "add",
        path: "/cycle3",
        type: "cycle",
        value: cycle,
      },
    };

    const parsedCycle = PatchCycle.safeParse(cyclePatch.value);
    expect(parsedCycle.error).toBe(undefined);
    expect(parsedCycle.success).toBe(true);

    const row = JSON.stringify(cyclePatch);

    const result = parseMessageRow(row, 0);

    expect(result).toHaveLength(1);
    invariant(result[0]);
    expect(result[0].type).toBe("message-part");
    invariant(result[0].document.type);
    invariant(result[0].document.type === "patch");
    invariant(result[0].document.value);
    expect(result[0].document.type).toBe("patch");
    expect(result[0].document.value.op).toBe("add");
    invariant(result[0].document.value.op === "add");
    expect(result[0].document.value.path).toBe("/cycle3");
    expect(result[0].document.value.value).toEqual(cycle);
  });
});
