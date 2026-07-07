import { identityAndVoice } from "./identityAndVoice";
import {
  renderStaticPromptTemplate,
  staticPromptParts,
} from "./staticPromptParts";
import { getVoiceDefinitions, getVoicePrompt } from "./voices";

describe("staticPromptParts", () => {
  it("includes identity, instructions and default voice for section agents", () => {
    const parts = staticPromptParts({
      includeIdentity: true,
      instructions: "Do the thing",
      defaultVoice: "EXPERT_TEACHER",
    });

    expect(parts.map((p) => p.content)).toEqual([
      identityAndVoice,
      "Do the thing",
      getVoiceDefinitions(["EXPERT_TEACHER"]),
      getVoicePrompt("EXPERT_TEACHER"),
    ]);
  });

  it("omits identity when not requested", () => {
    const parts = staticPromptParts({
      includeIdentity: false,
      instructions: "Plan it",
      defaultVoice: "AGENT_TO_AGENT",
    });

    expect(parts[0]?.content).toBe("Plan it");
  });

  it("prepends the default voice to the voices list without duplicating it", () => {
    const withoutDefault = staticPromptParts({
      includeIdentity: false,
      instructions: "x",
      voices: ["PUPIL"],
      defaultVoice: "EXPERT_TEACHER",
    });
    expect(withoutDefault[1]?.content).toBe(
      getVoiceDefinitions(["EXPERT_TEACHER", "PUPIL"]),
    );

    const alreadyIncluded = staticPromptParts({
      includeIdentity: false,
      instructions: "x",
      voices: ["EXPERT_TEACHER"],
      defaultVoice: "EXPERT_TEACHER",
    });
    expect(alreadyIncluded[1]?.content).toBe(
      getVoiceDefinitions(["EXPERT_TEACHER"]),
    );
  });

  it("emits only instructions when there is no voice (e.g. corrector)", () => {
    const parts = staticPromptParts({
      includeIdentity: false,
      instructions: "Correct it",
    });

    expect(parts).toHaveLength(1);
    expect(parts[0]?.content).toBe("Correct it");
  });

  it("renders a template by joining part contents", () => {
    expect(
      renderStaticPromptTemplate({
        includeIdentity: false,
        instructions: "only",
      }),
    ).toBe("only");
  });
});
