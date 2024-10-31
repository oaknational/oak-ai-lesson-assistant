import type { GenerationPart } from "../types";
import { sendEmail } from "./sendEmail";

const NEXT_PUBLIC_GLEAP_FEEDBACK_EMAIL_ADDR =
  process.env.NEXT_PUBLIC_GLEAP_FEEDBACK_EMAIL_ADDR;

if (!NEXT_PUBLIC_GLEAP_FEEDBACK_EMAIL_ADDR) {
  throw new Error(
    "Missing environment variable NEXT_PUBLIC_GLEAP_FEEDBACK_EMAIL_ADDR",
  );
}

export const sendQuizFeedbackEmail = async (input: {
  user: { email: string };
  feedback: {
    typedFeedback: string;
    contentIsInappropriate: boolean;
    contentIsFactuallyIncorrect: boolean;
    contentIsNotHelpful: boolean;
  };
  flaggedItem: GenerationPart<unknown>;
  generationResponse: string;
}) => {
  const { user, feedback, flaggedItem, generationResponse } = input;
  const inputDataAsString = JSON.stringify(input);

  const emailContent = `
    User ${user.email} has clicked on the flag button.

    Flagged content type: ${flaggedItem.type}
    Flagged content: ${flaggedItem.value}
    Generation ID: ${flaggedItem.lastGenerationId}
    Feedback: ${feedback.typedFeedback}
    Inappropriate content: ${feedback.contentIsInappropriate}
    Factually incorrect content: ${feedback.contentIsFactuallyIncorrect}
    Not helpful content: ${feedback.contentIsNotHelpful}
    Generation response: ${generationResponse}
    Full data of the time of the flag:

    ${inputDataAsString}
  `;

  return sendEmail({
    from: "ai.feedback@thenational.academy",
    to: NEXT_PUBLIC_GLEAP_FEEDBACK_EMAIL_ADDR,
    subject: "Feedback: generation flagged",
    body: emailContent,
  });
};
