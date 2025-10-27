import type { OpenAI } from "openai";

export const quizEffectivenessPrompt = `Given a lesson plan with prior knowledge requirements and key learning points, along with a proposed assessment question, rate the question's effectiveness on a scale of 1-10 (1 being least effective, 10 being most effective) based on the following criteria:
  1. Relevance to Prior Knowledge:
     - How well does the question address the specific prior knowledge outlined in the lesson plan?
     - Does it effectively probe the depth of understanding of prerequisite concepts?
  2. Alignment with Key Learning Points:
     - To what extent does the question target the main learning objectives of the lesson?
     - Does it require students to demonstrate understanding of the core concepts?
  3. Cognitive Level:
     - Does the question match the appropriate level of thinking (e.g., recall, application, analysis) for the lesson's objectives?
     - Does it challenge students to think critically or merely recall information?
  4. Clarity and Specificity:
     - Is the question clear and unambiguous?
     - Does it focus on specific knowledge or skills rather than being overly broad?
  5. Potential for Insight:
     - Will the answers to this question provide valuable information about students' understanding and potential misconceptions?
     - Can it help identify gaps in knowledge that need to be addressed during the lesson?
  Provide a numerical rating for each criterion and an overall rating. Justify your ratings with brief explanations, highlighting strengths and areas for improvement in the question.`;

export const QuizInspectionSystemPrompt: OpenAI.Chat.Completions.ChatCompletionSystemMessageParam =
  {
    role: "system" as const,
    content: quizEffectivenessPrompt,
  };

// Example Rating:
// Question: "What are the three states of matter?"

// Ratings:
// 1. Relevance to Prior Knowledge: 7/10
// 2. Alignment with Key Learning Points: 5/10
// 3. Cognitive Level: 3/10
// 4. Clarity and Specificity: 8/10
// 5. Potential for Insight: 4/10

// Overall Rating: 5.4/10

// Justification: The question is clearly related to basic knowledge about states of matter, which is likely part of the prior knowledge. It's specific and clear. However, it only requires recall of basic facts, lacking depth in assessing understanding or application of concepts. It may not fully align with more advanced learning points if the lesson goes beyond just naming the states. The question provides limited insight into students' deeper understanding of matter and its properties.`;
