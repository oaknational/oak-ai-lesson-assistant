/**
 * E2E harness for the agents-new-new minimal scaffold pipeline.
 */
import {
  type AilaNewState,
  ailaTurn,
  isLessonComplete,
  isMinimalLessonComplete,
} from "../pipeline";

const INITIAL_USER_MESSAGE = "Create KS4 maths lesson on circle theorems";

describe("agents-new-new minimal scaffold e2e", () => {
  it("populates title, keyStage, subject in <= 2 turns", () => {
    const initialState: AilaNewState = { doc: {}, messages: [], turnCount: 0 };

    let state = initialState;
    let userMessage = INITIAL_USER_MESSAGE;

    for (let i = 0; i < 2; i++) {
      const turn = ailaTurn({ state, userMessage });
      state = turn.state;
      if (isMinimalLessonComplete(state.doc)) break;
      userMessage = "Please ensure title, KS and subject are set."; // deterministic fallback
    }

    expect(isMinimalLessonComplete(state.doc)).toBe(true);
    // Full completion remains optional; verify no crash if partial.
    const full = isLessonComplete(state.doc);
    if (full) expect(full).toBe(true);
  });
});
