/* eslint-disable @cspell/spellchecker */
import { extractPatches, parseMessageParts } from "./jsonPatchProtocol";

describe("parseMessageParts", () => {
  it("correctly extracts patches from a partial, streaming message", () => {
    const content = `␞
{"type":"comment","value":"CHAT_START"}
␞
{"type":"llmMessage","patches":[{"type":"patch","reasoning":"The starter quiz is designed to assess pupils' prior knowledge about the Roman Empire and Roman Britain, which is essential before delving into the lesson's main content.","value":{"type":"quiz","op":"add","path":"/starterQuiz","value":[{"question":"What was the Roman Empire?","answers":["A large empire that ruled many territories including Britain."],"distractors":["A small kingdom in Europe.","A modern European country."]},{"question":"When did the Romans begin ruling Britain?","answers":["AD 43"],"distractors":["AD 410","AD 1066"]},{"question":"What was a Roman legion?","answers":["A unit of the Roman army."],"distractors":["A type of Roman building.","A Roman festival."]},{"question":"What influence did the Romans have on British architecture?","answers":["Introduced new building techniques and styles."],"distractors":["Made no impact on architecture.","Destroyed all previous architectural styles."]},{"question":"What was the primary language of Roman Britain?","answers":["Latin"],"distractors":["Greek","Celtic"]},{"question":"What marked the end of Roman rule in Britain?","answers":["The withdrawal of Roman legions."],"distractors":["The invasion of the Saxons.","The collapse of the Roman Senate."]}]},"status":"complete"},{"type":"patch","reasoning":"The first learning cycle focuses on identifying the key events that marked the end of Roman rule in Britain, providing a foundational understanding for pupils.","value":{"type":"cycle","op":"add","path":"/cycle1","value":{"title":"Identifying Key Events of Roman Withdrawal","durationInMinutes":15,"explanation":{"spokenExplanation":["Begin by explaining the significant events that led to the end of Roman rule in Britain, such as political instability and military needs elsewhere in the empire.","Discuss the role of key figures, such as the Roman Emperor Honorius, in the decision to withdraw troops.","Highlight the year AD 410 as a pivotal moment when the Romans officially abandoned Britain.","Explain how the withdrawal was a gradual process rather than a single event.","Use maps to show the extent of Roman control and the regions affected by the withdrawal."],"accompanyingSlideDetails":"A timeline highlighting key events from AD 400 to AD 410, showing the stages of Roman withdrawal from Britain.","imagePrompt":"Roman Britain timeline AD 400-410","slideText":"Key events leading to the end of Roman rule in Britain included political instability and the withdrawal of Roman legions by AD 410."},"checkForUnderstanding":[{"question":"Who was the Roman Emperor during the withdrawal from Britain?","answers":["Emperor Honorius"],"distractors":["Emperor Nero","Emperor Augustus"]},{"question":"In which year did the Romans officially abandon Britain?","answers":["AD 410"],"distractors":["AD 43","AD 1066"]}],"practice":"Create a timeline showing the key events from AD 400 to AD 410 that led to the end of Roman rule in Britain. Include at least three events with brief descriptions.","feedback":"Model answer: The timeline should include the following events: AD 400 - increasing pressures on Roman borders; AD 406 - crossing of the Rhine by Germanic tribes; AD 410 - Emperor Honorius' rescript advising Britons to defend themselves."}},"status":"complete"},{"type":"patch","reasoning":"The second learning cycle delves into explaining the causes behind the Roman withdrawal from Britain, enhancing pupils' understanding of historical causation.","value":{"type":"cycle","op":"add","path":"/cycle2","value":{"title":"Explaining Causes of Roman Withdrawal","durationInMinutes":15,"explanation":{"spokenExplanation":["Discuss the external pressures faced by the Roman Empire, such as invasions by Germanic tribes and the need to protect other parts of the empire.","Explain the economic strains on the Roman Empire, including overextension and resource allocation issues.","Explore the internal instability within the Roman government and its impact on decisions to withdraw.","Illustrate how these factors combined to make it unsustainable for Rome to maintain its hold over Britain.","Use examples of other territories that faced similar withdrawals during this period."],"accompanyingSlideDetails":"A map showing Roman Empire territories and the areas affected by external pressures and economic strains.","imagePrompt":"Roman Empire map external pressures AD 400","slideText":"External pressures and economic strains led to the Roman Empire withdrawing from Britain by AD 410."},"checkForUnderstanding":[{"question":"What external pressures did the Roman Empire face during its decline?","answers":["Invasions by Germanic tribes"],"distractors":["Economic prosperity","Peaceful expansion"]},{"question":"Why was maintaining control over Britain unsustainable for the Romans?","answers":["Due to overextension and resource issues."],"distractors":["Because Britain was too small.","Because of a lack of interest."]}],"practice":"Write a short paragraph explaining the main reasons for the Roman withdrawal from Britain, using evidence from the lesson to support your points.","feedback":"Model answer: The Roman withdrawal from Britain was primarily due to external pressures such as Germanic invasions, economic strains from overextension, and internal instability within the Roman government."}},"status":"complete"},{"type":"patch","reasoning":"The third learning cycle focuses on analysing the impact of Roman withdrawal, allowing pupils to consider the broader implications on society and culture.","value":{"type":"cycle","op":"add","path":"/cycle3","value":{"title":"Analysing Impact of Roman Withdrawal on Britain","durationInMinutes":15,"explanation":{"spokenExplanation":["Explain the immediate effects of the Roman withdrawal on British society, such as increased vulnerability to invasions and loss of centralized governance.","Discuss the long-term cultural impacts, including the retention of Roman infrastructure and legal systems.","Highlight the transition to the Anglo-Saxon period and its implications for British history.","Provide examples of Roman cultural and architectural influences that persisted, like roads and villas.","Encourage discussion on how the absence of Roman protection affected daily life in Britain."],"accompanyingSlideDetails":"Images of Roman roads and villas in Britain, and a`;
    const { validPatches } = extractPatches(content);

    expect(validPatches).toHaveLength(3);
    expect(validPatches[0]?.type).toBe("patch");
    expect(validPatches[1]?.type).toBe("patch");
    expect(validPatches[2]?.type).toBe("patch");
  });

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
