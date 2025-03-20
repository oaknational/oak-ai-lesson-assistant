export const messages = {
  user1: {
    role: "user",
    content: "Make me a custom lesson plan about Roman Britain",
  },
  assistant1: {
    role: "assistant",
    content: "Here's a lesson about Roman Britain",
  },
  user2Refinement: {
    role: "user",
    content: "Add more castles",
  },
  assistant2Refinement: {
    role: "assistant",
    content: "Here's a lesson about Roman Britain with more castles",
  },
} as const;
