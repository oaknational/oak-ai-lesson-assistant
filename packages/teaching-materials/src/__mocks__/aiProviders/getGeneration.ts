export const getLLMGeneration = jest.fn().mockResolvedValue({
  title: "Test Lesson",
  learningOutcome: "Students will learn about test concepts",
  learningCycles: [
    {
      title: "Introduction",
      durationInMinutes: 10,
      explanation: "Introduction to the topic",
    },
  ],
});
