/* eslint-disable @cspell/spellchecker */
export const createMessageStates = (fixedDate: Date) => ({
  userRequest: [
    {
      content:
        "Create a lesson plan about the end of Roman Britain for key stage 3 history",
      role: "user",
      id: "u-xE6aXHnAeBTzFTu8",
      createdAt: fixedDate,
    },
  ],
  stableMessages: [
    {
      content:
        "Create a lesson plan about the end of Roman Britain for key stage 3 history",
      role: "user",
      id: "u-ROEdSl4mxvurLJqg",
      createdAt: fixedDate,
    },
    {
      id: "a-G7_z8CnQIGUjdFEk",
      role: "assistant",
      content:
        '\n␞\n{"type":"patch","reasoning":"generated","value":{"op":"add","path":"/title","value":"The end of Roman Britain"},"status":"complete"}\n␞\n\n␞\n{"type":"patch","reasoning":"generated","value":{"op":"add","path":"/subject","value":"history"},"status":"complete"}\n␞\n\n␞\n{"type":"patch","reasoning":"generated","value":{"op":"add","path":"/keyStage","value":"key-stage-3"},"status":"complete"}\n␞\n\n␞\n{"type":"comment","value":"CHAT_START"}\n␞\n{"type":"llmMessage","sectionsToEdit":[],"patches":[],"sectionsEdited":[],"prompt":{"type":"text","value":"These Oak lessons might be relevant:\\n1. The End of Roman Britain\\n2. Anglo-Saxon Society and the Dark Ages\\n3. The Anglo-Saxon Kingdoms\\n4. The arrival of the Anglo-Saxons\\n5. The return of towns in Anglo-Saxon Britain\\n\\nTo base your lesson on one of these existing Oak lessons, type the lesson number. Tap **Continue** to start from scratch."},"status":"complete"}\n␞\n{"type":"id","value":"a-G7_z8CnQIGUjdFEk"}\n␞\n\n␞\n{"type":"comment","value":"MODERATION_START"}\n␞\n\n␞\n{"type":"comment","value":"MODERATING"}\n␞\n\n␞\n{"type":"moderation","categories":[],"id":"cm6uzvfh1000nn41l37dl414n"}\n␞\n\n␞\n{"type":"comment","value":"CHAT_COMPLETE"}\n␞\n',
      createdAt: fixedDate,
    },
    {
      content: "continue",
      role: "user",
      id: "u-U53lt6NJM6Pqjz4L",
      createdAt: fixedDate,
    },
    {
      id: "a-MA06spVOqZu1-MaD",
      role: "assistant",
      content:
        '\n␞\n{"type":"comment","value":"CHAT_START"}\n␞\n{"type":"llmMessage","sectionsToEdit":[],"patches":[{"type":"patch","reasoning":"Setting the learning outcome to establish the focus of the lesson by detailing the impact of the Roman Empire\'s departure from Britain.","value":{"type":"string","op":"add","path":"/learningOutcome","value":"I can describe the impact of the Roman Empire\'s departure from Britain."},"status":"complete"}],"sectionsEdited":["learningOutcome"],"prompt":{"type":"text","value":"Is the learning outcome appropriate for your pupils? If not, suggest an edit. Otherwise, tap **Continue** to move on to the next step."},"status":"complete"}\n␞\n{"type":"id","value":"a-MA06spVOqZu1-MaD"}\n␞\n\n␞\n{"type":"comment","value":"MODERATION_START"}\n␞\n\n␞\n{"type":"comment","value":"MODERATING"}\n␞\n',
      createdAt: fixedDate,
    },
  ],
  stableAndStreaming: [
    {
      content:
        "Create a lesson plan about the end of Roman Britain for key stage 3 history",
      role: "user",
      id: "u-ROEdSl4mxvurLJqg",
      createdAt: fixedDate,
    },
    {
      id: "a-G7_z8CnQIGUjdFEk",
      role: "assistant",
      content:
        '\n␞\n{"type":"patch","reasoning":"generated","value":{"op":"add","path":"/title","value":"The end of Roman Britain"},"status":"complete"}\n␞\n\n␞\n{"type":"patch","reasoning":"generated","value":{"op":"add","path":"/subject","value":"history"},"status":"complete"}\n␞\n\n␞\n{"type":"patch","reasoning":"generated","value":{"op":"add","path":"/keyStage","value":"key-stage-3"},"status":"complete"}\n␞\n\n␞\n{"type":"comment","value":"CHAT_START"}\n␞\n{"type":"llmMessage","sectionsToEdit":[],"patches":[],"sectionsEdited":[],"prompt":{"type":"text","value":"These Oak lessons might be relevant:\\n1. The End of Roman Britain\\n2. Anglo-Saxon Society and the Dark Ages\\n3. The Anglo-Saxon Kingdoms\\n4. The arrival of the Anglo-Saxons\\n5. The return of towns in Anglo-Saxon Britain\\n\\nTo base your lesson on one of these existing Oak lessons, type the lesson number. Tap **Continue** to start from scratch."},"status":"complete"}\n␞\n{"type":"id","value":"a-G7_z8CnQIGUjdFEk"}\n␞\n\n␞\n{"type":"comment","value":"MODERATION_START"}\n␞\n\n␞\n{"type":"comment","value":"MODERATING"}\n␞\n\n␞\n{"type":"moderation","categories":[],"id":"cm6uzvfh1000nn41l37dl414n"}\n␞\n\n␞\n{"type":"comment","value":"CHAT_COMPLETE"}\n␞\n',
      createdAt: fixedDate,
    },
    {
      content: "continue",
      role: "user",
      id: "u-U53lt6NJM6Pqjz4L",
      createdAt: fixedDate,
    },
    {
      id: "TEMP_PENDING_wNvS0UN9dKM6eCgmLU54w",
      role: "assistant",
      content:
        '\n␞\n{"type":"comment","value":"CHAT_START"}\n␞\n{"type":"llmMessage","sectionsToEdit":[],"patches":[{"type":"patch","reasoning":"Setting the learning outcome to ',
      createdAt: fixedDate,
    },
  ],
  streamingMessage: [
    {
      id: "TEMP_PENDING_wNvS0UN9dKM6eCgmLU54w",
      role: "assistant",
      content:
        '\n␞\n{"type":"comment","value":"CHAT_START"}\n␞\n{"type":"llmMessage","sectionsToEdit":["learningOutcome","learningCycles","priorKnowledge","keyLearningPoints"],"patches":[{"type":"patch","reasoning":"Set the learning outcome to focus the lesson on the impact of the Roman Empire\'s departure from Britain.","value":{"type":"string","op":"add","path":"/learningOutcome","value":"I can describe the impact of the Roman Empire\'s departure from Britain."},"status":"complete"},{"type":"patch","reasoning":"Break down the learning outcome into specific learning cycles to guide the lesson structure.","value":{"type":"string-array","op":"add","path":"/learningCycles","value":["Explain why the Roman Empire left Britain","Describe the changes in Britain after the Romans left","Recognise the role of archaeologists in understanding Roman Britain"]},"status":"complete"},{"type":"',
      createdAt: fixedDate,
    },
  ],
});
