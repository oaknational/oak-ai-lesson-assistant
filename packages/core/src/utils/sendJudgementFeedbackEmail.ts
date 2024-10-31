import { sendEmail } from "./sendEmail";

const NEXT_PUBLIC_GLEAP_FEEDBACK_EMAIL_ADDR =
  process.env.NEXT_PUBLIC_GLEAP_FEEDBACK_EMAIL_ADDR;

if (!NEXT_PUBLIC_GLEAP_FEEDBACK_EMAIL_ADDR) {
  throw new Error(
    "Missing environment variable NEXT_PUBLIC_GLEAP_FEEDBACK_EMAIL_ADDR",
  );
}

export const sendJudgementFeedbackEmail = async (input: {
  user: { email: string };
  feedback: {
    typedFeedback: string;
    contentIsInappropriate: boolean;
    contentIsFactuallyIncorrect: boolean;
    contentIsNotHelpful: boolean;
  };
  flaggedItem: string;
}) => {
  const { user, feedback, flaggedItem } = input;
  const inputDataAsString = JSON.stringify(input);

  const emailContent = `<p>
    User ${user.email} has clicked on the flag button on a comparative judgement. <br>
    Please check the database for more information: <br>

    <br>
    <br>

    ${flaggedItem} <br>
    Feedback: ${feedback.typedFeedback}<br>
    Inappropriate content: ${feedback.contentIsInappropriate}<br>
    Factually incorrect content: ${feedback.contentIsFactuallyIncorrect}<br>
    Not helpful content: ${feedback.contentIsNotHelpful}<br>
    Full data of the time of the flag:<br>

    ${inputDataAsString}</p>
  `;

  return sendEmail({
    from: "ai.feedback@thenational.academy",
    to: NEXT_PUBLIC_GLEAP_FEEDBACK_EMAIL_ADDR,
    subject: "Feedback: comparative judgement result flagged",
    htmlBody: emailContent,
  });
};
