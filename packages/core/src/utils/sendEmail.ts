import { stripHtml } from "./stripHtml";

type EmailParams = {
  from: string;
  to: string;
  htmlBody: string;
  subject: string;
  name?: string;
};

const POSTMARK_SERVER_TOKEN = process.env.POSTMARK_SERVER_TOKEN;

if (!POSTMARK_SERVER_TOKEN) {
  throw new Error("Missing env var POSTMARK_SERVER_TOKEN");
}

export const sendEmail = async ({
  from,
  to,
  subject,

  name,
  htmlBody,
}: EmailParams) => {
  const url = "https://api.postmarkapp.com/email";
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Postmark-Server-Token": POSTMARK_SERVER_TOKEN,
  };

  const formattedFrom = name
    ? `${name} <${from}>`
    : `Oak National Academy <${from}>`;

  const bodyJSON = JSON.stringify({
    From: formattedFrom,
    To: to,
    Subject: subject,
    ReplyTo: "help@thenational.academy",
    TextBody: stripHtml(htmlBody),
    HtmlBody: `<html><body>${htmlBody}</body></html>`,
    MessageStream: "outbound",
  });

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: bodyJSON,
  });

  if (!response.ok) {
    throw new Error("Failed to send email");
  }

  return response;
};
