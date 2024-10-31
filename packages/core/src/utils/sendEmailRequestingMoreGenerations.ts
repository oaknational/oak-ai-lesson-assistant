import { sendEmail } from "./sendEmail";

const NEXT_PUBLIC_GLEAP_FEEDBACK_EMAIL_ADDR =
  process.env.NEXT_PUBLIC_GLEAP_FEEDBACK_EMAIL_ADDR;

if (!NEXT_PUBLIC_GLEAP_FEEDBACK_EMAIL_ADDR) {
  throw new Error("Missing env var NEXT_PUBLIC_GLEAP_FEEDBACK_EMAIL_ADDR");
}

export const sendEmailRequestingMoreGenerations = async (input: {
  appSlug: string;
  userEmail: string;
}) => {
  const emailContent = `
    <p>User ${input.userEmail} has requested more generations for app ${input.appSlug}.</p>
  `;

  return sendEmail({
    from: "ai.feedback@thenational.academy",
    to: NEXT_PUBLIC_GLEAP_FEEDBACK_EMAIL_ADDR,
    subject: "Feedback: generation flagged",
    htmlBody: emailContent,
  });
};
