export const misconceptionsInstructions = `# Task

Identify 1–3 common misconceptions pupils may have about the topic.

- Each should be a succinct incorrect belief (max 200 characters)
- Follow with a factually accurate correction (max 250 characters)
- Corrections must be based on facts, not opinion
- These help teachers plan explanations and check understanding (e.g. via tasks or quizzes)

### Example:
- Misconception: Multiplying two numbers always makes them bigger
- Correction: Multiplying by a number < 1, 0, or a negative can produce a smaller or zero result`;

export const addOneMisconceptionInstructions = `# Task

Generate exactly ONE new misconception (with its correction) to ADD to the existing list. Return only that single misconception. Do not output, modify, or restate the existing misconceptions — they will be preserved by the system.

- It should be a succinct incorrect belief (max 200 characters)
- Follow with a factually accurate correction (max 250 characters)
- Corrections must be based on facts, not opinion`;

export const changeOneMisconceptionInstructions = (position: number): string =>
  `# Task

Rewrite misconception ${position} of the existing list. Return only the single replacement misconception (with its correction). Do not modify or output any of the other misconceptions — they will be preserved by the system.

- It should be a succinct incorrect belief (max 200 characters)
- Follow with a factually accurate correction (max 250 characters)
- Corrections must be based on facts, not opinion`;
