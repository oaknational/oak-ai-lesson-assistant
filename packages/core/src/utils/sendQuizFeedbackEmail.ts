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

  const emailContent = `<p>
    User ${user.email} has clicked on the flag button.<br>
    <br>
    Flagged content type: ${flaggedItem.type}<br>
    Flagged content: ${typeof flaggedItem.value == "string" ? flaggedItem.value : ""}<br>
    Generation ID: ${flaggedItem.lastGenerationId}<br>
    Feedback: ${feedback.typedFeedback}<br>
    Inappropriate content: ${feedback.contentIsInappropriate}<br>
    Factually incorrect content: ${feedback.contentIsFactuallyIncorrect}<br>
    Not helpful content: ${feedback.contentIsNotHelpful}<br>
    Generation response: ${generationResponse}<br>
    Full data of the time of the flag:<br>
    <br>
    ${inputDataAsString}</p>
  `;

  return sendEmail({
    from: "ai.feedback@thenational.academy",
    to: NEXT_PUBLIC_GLEAP_FEEDBACK_EMAIL_ADDR,
    subject: "Feedback: generation flagged",
    htmlBody: emailContent,
  });
};
