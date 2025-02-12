import type { TestRating } from "../rerankers/RerankerStructuredOutputSchema";

// Fixture 1
const fixture1: TestRating = {
  rating: 0.9,
  justification:
    "### Question 1: How many degrees in 2 right angles?\n1. Relevance to Prior Knowledge: 10\n   - Directly addresses knowledge of angles, specifically right angles mentioned in the prior knowledge.\n2. Alignment with Key Learning Points: 9\n   - Indirectly aligns as it relates to understanding measurement of angles.\n3. Cognitive Level: 9\n   - Simple recall level, appropriate for introductory assessment.\n4. Clarity and Specificity: 10\n   - Clear and unambiguous.\n5. Potential for Insight: 9\n   - Checks basic knowledge of angles effectively.\n   \nOverall rating is high because it efficiently measures the students' understanding of angles, directly relating to prior knowledge. There’s no ambiguity in the question, and it serves as a good starting point for assessing basic understanding.",
};

// Fixture 2
const fixture2: TestRating = {
  rating: 0.7,
  justification:
    "### Question 2: What is the capital of France?\n1. Relevance to Prior Knowledge: 8\n   - Common general knowledge question.\n2. Alignment with Key Learning Points: 7\n   - Not directly related to the lesson's key points.\n3. Cognitive Level: 6\n   - Requires recall of factual information.\n4. Clarity and Specificity: 9\n   - Clear and straightforward.\n5. Potential for Insight: 6\n   - Limited insight into deeper understanding.",
};

// Fixture 3
const fixture3: TestRating = {
  rating: 0.5,
  justification:
    "### Question 3: Explain the theory of relativity.\n1. Relevance to Prior Knowledge: 5\n   - Advanced topic, not covered in prior lessons.\n2. Alignment with Key Learning Points: 4\n   - Not aligned with current learning objectives.\n3. Cognitive Level: 8\n   - Requires higher-order thinking.\n4. Clarity and Specificity: 5\n   - Complex and potentially confusing.\n5. Potential for Insight: 7\n   - Offers insight into advanced understanding if answered well.",
};

// Fixture 4
const fixture4: TestRating = {
  rating: 0.3,
  justification:
    "### Question 4: What is the color of the sky?\n1. Relevance to Prior Knowledge: 3\n   - Too basic for the current level.\n2. Alignment with Key Learning Points: 2\n   - Not relevant to the lesson.\n3. Cognitive Level: 2\n   - Very low cognitive demand.\n4. Clarity and Specificity: 10\n   - Extremely clear.\n5. Potential for Insight: 1\n   - Provides no real insight.",
};

// Fixture 5
const fixture5: TestRating = {
  rating: 0.8,
  justification:
    "### Question 5: Solve for x in the equation 2x + 3 = 7.\n1. Relevance to Prior Knowledge: 9\n   - Builds on algebraic concepts previously taught.\n2. Alignment with Key Learning Points: 8\n   - Directly related to current learning objectives.\n3. Cognitive Level: 7\n   - Requires application of knowledge.\n4. Clarity and Specificity: 9\n   - Clear and specific.\n5. Potential for Insight: 8\n   - Good measure of understanding of basic algebra.",
};

// Fixture 6
const fixture6: TestRating = {
  rating: 0.6,
  justification:
    "### Question 6: Describe the process of photosynthesis.\n1. Relevance to Prior Knowledge: 6\n   - Partially covered in previous lessons.\n2. Alignment with Key Learning Points: 5\n   - Somewhat related to current objectives.\n3. Cognitive Level: 7\n   - Requires understanding and explanation.\n4. Clarity and Specificity: 6\n   - Moderately clear.\n5. Potential for Insight: 7\n   - Provides insight into understanding of biological processes.",
};

export const cachedQuizRatings: TestRating[] = [
  fixture1,
  fixture2,
  fixture3,
  fixture4,
  fixture5,
  fixture6,
];
