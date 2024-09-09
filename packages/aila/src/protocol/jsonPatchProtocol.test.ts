import { parseMessageParts } from "./jsonPatchProtocol";

describe("parseMessageParts", () => {
  it("correctly handles complex output with multiple parts", () => {
    const content = `{"type":"llmMessage","patches":[{"type":"patch","reasoning":"Learning outcomes help to define what the students will achieve by the end of the lesson.","value":{"op":"add","path":"/learningOutcome","value":"I can explain the factors that led to the end of Roman Britain and its impact."}},{"type":"patch","reasoning":"Learning cycles guide the teacher on specific content delivery in manageable chunks.","value":{"op":"add","path":"/learningCycles","value":["Describe the key events leading to the end of Roman Britain","Explain the impact of the end of Roman Britain on the local population","Analyse the legacy left by the Romans in Britain"]}}],"prompt":{"type":"text","value":"I have set the learning outcomes. Would you like to continue?"}}
␞
{"type":"id","value":"a-6MdGWrCQ4IFYc-FZ"}
␞

␞
{"type":"moderation","categories":[],"id":"cm0p9m2330007a20s5lepwcrc"}
␞

␞
{"type":"state","reasoning":"final","value":{"title":"The End of Roman Britain","subject":"history","keyStage":"key-stage-3","learningOutcome":"I can explain the factors that led to the end of Roman Britain and its impact.","learningCycles":["Describe the key events leading to the end of Roman Britain","Explain the impact of the end of Roman Britain on the local population","Analyse the legacy left by the Romans in Britain"]}}
␞
`;

    const result = parseMessageParts(content);

    expect(result).toHaveLength(6);
    expect(result[0]?.document?.type).toBe("patch");
    expect(result[1]?.document?.type).toBe("patch");
    expect(result[2]?.document?.type).toBe("text");
    expect(result[3]?.document?.type).toBe("id");
    expect(result[4]?.document?.type).toBe("moderation");
    expect(result[5]?.document?.type).toBe("state");
  });

  it("correctly extracts message parts from a complex response", () => {
    const content = `{"type":"llmMessage","patches":[{"type":"patch","reasoning":"Generated learning outcomes and cycles for the topic 'The End of Roman Britain,' which are achievable within the lesson timeframe.","value":{"op":"add","path":"/learningOutcome","value":"I can explain the factors that led to the end of Roman rule in Britain."}},{"type":"patch","reasoning":"Generated learning outcomes and cycles for the topic 'The End of Roman Britain,' which are achievable within the lesson timeframe.","value":{"op":"add","path":"/learningCycles","value":["Identify the key reasons for the end of Roman Britain","Explain the impact of the end of Roman rule on Britain","Evaluate the long-term consequences of the end of Roman Britain"]}}],"prompt":{"type":"text","value":"I have set the learning outcomes. Would you like to continue?"}}
␞
{"type":"id","value":"a-8lkqhJdBVORCqab2"}
␞

␞
{"type":"moderation","categories":[],"id":"cm0p8vsvf0007vr6rj9sgvglj"}
␞

␞
{"type":"state","reasoning":"final","value":{"title":"The End of Roman Britain","subject":"history","keyStage":"key-stage-3","topic":"The End of Roman Britain"}}
␞
`;

    const result = parseMessageParts(content);

    expect(result).toHaveLength(6);
    expect(result[0]?.document?.type).toBe("patch");
    expect(result[1]?.document?.type).toBe("patch");
    expect(result[2]?.document?.type).toBe("text");
    expect(result[3]?.document?.type).toBe("id");
    expect(result[4]?.document?.type).toBe("moderation");
    expect(result[5]?.document?.type).toBe("state");
  });
});
