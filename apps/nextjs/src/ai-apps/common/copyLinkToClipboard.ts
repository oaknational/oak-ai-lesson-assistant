import { aiLogger } from "@oakai/logger";

const log = aiLogger("chat");
export const copyLinkToClipboard = () => {
  const currentURL = window.location.href;
  navigator.clipboard
    .writeText(currentURL)
    .then(() => {
      alert("Link copied to clipboard!");
    })
    .catch((error) => {
      log.error(error);
    });
};
