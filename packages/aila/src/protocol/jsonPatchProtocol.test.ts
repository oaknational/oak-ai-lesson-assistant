import { extractMessageParts } from "./jsonPatchProtocol";

describe("extractMessageParts", () => {
  it("correctly handles complex output with multiple parts", () => {
    const content = `{"type":"llmResponse","patches":[{"type":"patch","reasoning":"Learning outcomes help to define what the students will achieve by the end of the lesson.","value":{"op":"add","path":"/learningOutcome","value":"I can explain the factors that led to the end of Roman Britain and its impact."}},{"type":"patch","reasoning":"Learning cycles guide the teacher on specific content delivery in manageable chunks.","value":{"op":"add","path":"/learningCycles","value":["Describe the key events leading to the end of Roman Britain","Explain the impact of the end of Roman Britain on the local population","Analyse the legacy left by the Romans in Britain"]}}]}
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

    const result = extractMessageParts(content);

    expect(result).toHaveLength(5);
    expect(result[0]).toBe(
      '{"type":"patch","reasoning":"Learning outcomes help to define what the students will achieve by the end of the lesson.","value":{"op":"add","path":"/learningOutcome","value":"I can explain the factors that led to the end of Roman Britain and its impact."}}',
    );
    expect(result[1]).toBe(
      '{"type":"patch","reasoning":"Learning cycles guide the teacher on specific content delivery in manageable chunks.","value":{"op":"add","path":"/learningCycles","value":["Describe the key events leading to the end of Roman Britain","Explain the impact of the end of Roman Britain on the local population","Analyse the legacy left by the Romans in Britain"]}}',
    );
    expect(result[2]).toBe('{"type":"id","value":"a-6MdGWrCQ4IFYc-FZ"}');
    expect(result[3]).toBe(
      '{"type":"moderation","categories":[],"id":"cm0p9m2330007a20s5lepwcrc"}',
    );
    expect(result[4]).toBe(
      '{"type":"state","reasoning":"final","value":{"title":"The End of Roman Britain","subject":"history","keyStage":"key-stage-3","learningOutcome":"I can explain the factors that led to the end of Roman Britain and its impact.","learningCycles":["Describe the key events leading to the end of Roman Britain","Explain the impact of the end of Roman Britain on the local population","Analyse the legacy left by the Romans in Britain"]}}',
    );
  });

  it("correctly extracts message parts from a complex response", () => {
    const content = `{"type":"llmResponse","patches":[{"type":"patch","reasoning":"Generated learning outcomes and cycles for the topic 'The End of Roman Britain,' which are achievable within the lesson timeframe.","value":{"op":"add","path":"/learningOutcome","value":"I can explain the factors that led to the end of Roman rule in Britain."}},{"type":"patch","reasoning":"Generated learning outcomes and cycles for the topic 'The End of Roman Britain,' which are achievable within the lesson timeframe.","value":{"op":"add","path":"/learningCycles","value":["Identify the key reasons for the end of Roman Britain","Explain the impact of the end of Roman rule on Britain","Evaluate the long-term consequences of the end of Roman Britain"]}}]}
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

    const result = extractMessageParts(content);

    expect(result).toHaveLength(5);
    expect(result[0]).toEqual(
      JSON.stringify({
        type: "patch",
        reasoning:
          "Generated learning outcomes and cycles for the topic 'The End of Roman Britain,' which are achievable within the lesson timeframe.",
        value: {
          op: "add",
          path: "/learningOutcome",
          value:
            "I can explain the factors that led to the end of Roman rule in Britain.",
        },
      }),
    );
    expect(result[1]).toEqual(
      JSON.stringify({
        type: "patch",
        reasoning:
          "Generated learning outcomes and cycles for the topic 'The End of Roman Britain,' which are achievable within the lesson timeframe.",
        value: {
          op: "add",
          path: "/learningCycles",
          value: [
            "Identify the key reasons for the end of Roman Britain",
            "Explain the impact of the end of Roman rule on Britain",
            "Evaluate the long-term consequences of the end of Roman Britain",
          ],
        },
      }),
    );
    expect(result[2]).toEqual('{"type":"id","value":"a-8lkqhJdBVORCqab2"}');
    expect(result[3]).toEqual(
      '{"type":"moderation","categories":[],"id":"cm0p8vsvf0007vr6rj9sgvglj"}',
    );
    expect(result[4]).toEqual(
      '{"type":"state","reasoning":"final","value":{"title":"The End of Roman Britain","subject":"history","keyStage":"key-stage-3","topic":"The End of Roman Britain"}}',
    );
  });
});
