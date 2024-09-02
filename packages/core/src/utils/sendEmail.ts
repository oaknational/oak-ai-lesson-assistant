type EmailParams = {
  from: string;
  to: string;
  body: string;
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
  body,
  name,
}: EmailParams) => {
  const url = "https://api.postmarkapp.com/email";
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Postmark-Server-Token": POSTMARK_SERVER_TOKEN,
  };

  const bodyJSON = JSON.stringify({
    From: from,
    To: to,
    Subject: subject,
    Name: name ?? "Oak National Academy",
    ReplyTo: "help@thenational.academy",
    TextBody: body,
    HtmlBody: `<html><body><pre>${body}</pre></body></html>`,
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
