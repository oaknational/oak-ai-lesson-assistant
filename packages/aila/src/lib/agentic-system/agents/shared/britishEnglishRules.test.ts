import { britishEnglishCorrectorAgentInstructions } from "../britishEnglishCorrectorAgent/britishEnglishCorrectorAgent.instructions";
import { identityAndVoice } from "../sectionAgents/shared/identityAndVoice";
import { britishEnglishRules } from "./britishEnglishRules";

describe("britishEnglishRules", () => {
  it("is included verbatim in the section agents' identityAndVoice prompt", () => {
    expect(identityAndVoice).toContain(britishEnglishRules);
  });

  it("is included verbatim in the corrector agent's instructions", () => {
    expect(britishEnglishCorrectorAgentInstructions).toContain(
      britishEnglishRules,
    );
  });
});
