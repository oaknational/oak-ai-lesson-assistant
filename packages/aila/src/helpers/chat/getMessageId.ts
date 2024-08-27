import crypto from "crypto";

/**
 * Returns or generates a unique message ID based on the message content.
 */
export function getMessageId(message: { content: string; id?: string }) {
  if (message.id) {
    return message.id;
  }
  return crypto
    .createHash("sha256")
    .update(message.content)
    .digest("hex")
    .slice(0, 16);
}
